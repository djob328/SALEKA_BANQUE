const db = require('../../config/database');
const OTPService = require('../otp/OTPService');

class TransferService {
    /**
     * Transfer money between accounts
     * @param {number} userId - User ID
     * @param {Object} transferData - Transfer details
     * @returns {Promise<Object>} Transfer result
     */
    async transferMoney(userId, transferData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { amount, beneficiaryAccountNumber, description, type = 'internal' } = transferData;

            // Get sender account
            const [senderAccounts] = await connection.query(
                `SELECT * FROM accounts WHERE user_id = ? AND status = 'active' LIMIT 1`,
                [userId]
            );

            if (senderAccounts.length === 0) {
                throw new Error('Aucun compte actif trouvé');
            }

            const senderAccount = senderAccounts[0];

            // Check sufficient balance
            if (parseFloat(senderAccount.available_balance) < amount) {
                throw new Error('Solde insuffisant');
            }

            // Get beneficiary account
            const [beneficiaryAccounts] = await connection.query(
                `SELECT * FROM accounts WHERE account_number = ? AND status = 'active'`,
                [beneficiaryAccountNumber]
            );

            if (beneficiaryAccounts.length === 0) {
                throw new Error('Compte bénéficiaire introuvable');
            }

            const beneficiaryAccount = beneficiaryAccounts[0];

            // Check if transferring to same account
            if (senderAccount.id === beneficiaryAccount.id) {
                throw new Error('Impossible de transférer vers le même compte');
            }

            // Generate OTP for validation
            const otp = await OTPService.generateOTP(userId, 'transfer', {
                amount,
                fromAccount: senderAccount.account_number,
                toAccount: beneficiaryAccount.account_number
            });

            await connection.rollback();

            return {
                success: true,
                requiresOTP: true,
                message: 'Un code OTP a été envoyé. Veuillez le saisir pour confirmer le virement.',
                otpReference: otp.reference,
                transferDetails: {
                    amount,
                    from: senderAccount.account_number,
                    to: beneficiaryAccount.account_number,
                    description
                }
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Confirm transfer with OTP
     * @param {number} userId - User ID
     * @param {string} otpCode - OTP code
     * @param {string} otpReference - OTP reference
     * @returns {Promise<Object>} Transfer confirmation
     */
    async confirmTransfer(userId, otpCode, otpReference) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Validate OTP
            const otpValidation = await OTPService.validateOTP(userId, otpCode, otpReference);
            if (!otpValidation.valid) {
                throw new Error('Code OTP invalide ou expiré');
            }

            const transferData = otpValidation.metadata;

            // Get accounts
            const [senderAccounts] = await connection.query(
                `SELECT * FROM accounts WHERE account_number = ?`,
                [transferData.fromAccount]
            );

            const [beneficiaryAccounts] = await connection.query(
                `SELECT * FROM accounts WHERE account_number = ?`,
                [transferData.toAccount]
            );

            const senderAccount = senderAccounts[0];
            const beneficiaryAccount = beneficiaryAccounts[0];

            // Check balance again
            if (parseFloat(senderAccount.available_balance) < transferData.amount) {
                throw new Error('Solde insuffisant');
            }

            // Deduct from sender
            const newSenderBalance = parseFloat(senderAccount.balance) - transferData.amount;
            const newSenderAvailable = parseFloat(senderAccount.available_balance) - transferData.amount;

            await connection.query(
                `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                [newSenderBalance, newSenderAvailable, senderAccount.id]
            );

            // Add to beneficiary
            const newBeneficiaryBalance = parseFloat(beneficiaryAccount.balance) + transferData.amount;
            const newBeneficiaryAvailable = parseFloat(beneficiaryAccount.available_balance) + transferData.amount;

            await connection.query(
                `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                [newBeneficiaryBalance, newBeneficiaryAvailable, beneficiaryAccount.id]
            );

            // Create transaction record for sender
            await connection.query(
                `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                 VALUES (?, 'debit', ?, ?, ?, ?)`,
                [senderAccount.id, transferData.amount, transferData.description || 'Virement', newSenderBalance, this.generateReference()]
            );

            // Create transaction record for beneficiary
            await connection.query(
                `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                 VALUES (?, 'credit', ?, ?, ?, ?)`,
                [beneficiaryAccount.id, transferData.amount, `Virement de ${senderAccount.account_number}`, newBeneficiaryBalance, this.generateReference()]
            );

            // Save transfer record
            await connection.query(
                `INSERT INTO transfers (from_account_id, to_account_id, amount, description, status, reference) 
                 VALUES (?, ?, ?, ?, 'completed', ?)`,
                [senderAccount.id, beneficiaryAccount.id, transferData.amount, transferData.description, this.generateReference()]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Virement effectué avec succès',
                transactionId: this.generateReference()
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Add beneficiary to favorites
     * @param {number} userId - User ID
     * @param {Object} beneficiaryData - Beneficiary details
     * @returns {Promise<Object>} Result
     */
    async addBeneficiary(userId, beneficiaryData) {
        const connection = await db.getConnection();
        try {
            const { name, accountNumber, bank } = beneficiaryData;

            // Check if account exists
            const [accounts] = await connection.query(
                `SELECT id FROM accounts WHERE account_number = ?`,
                [accountNumber]
            );

            if (accounts.length === 0) {
                throw new Error('Compte bénéficiaire introuvable');
            }

            // Check if already in favorites
            const [existing] = await connection.query(
                `SELECT id FROM beneficiaries WHERE user_id = ? AND account_number = ?`,
                [userId, accountNumber]
            );

            if (existing.length > 0) {
                throw new Error('Ce bénéficiaire est déjà dans vos favoris');
            }

            await connection.query(
                `INSERT INTO beneficiaries (user_id, name, account_number, bank) VALUES (?, ?, ?, ?)`,
                [userId, name, accountNumber, bank || 'SALEKABANQUE']
            );

            return {
                success: true,
                message: 'Bénéficiaire ajouté avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get beneficiaries
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Beneficiaries list
     */
    async getBeneficiaries(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );

            return {
                success: true,
                beneficiaries: rows
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Schedule a transfer
     * @param {number} userId - User ID
     * @param {Object} scheduleData - Schedule details
     * @returns {Promise<Object>} Result
     */
    async scheduleTransfer(userId, scheduleData) {
        const connection = await db.getConnection();
        try {
            const { amount, beneficiaryAccountNumber, description, scheduledDate, isRecurring, frequency } = scheduleData;

            await connection.query(
                `INSERT INTO scheduled_transfers 
                 (user_id, amount, beneficiary_account, description, scheduled_date, is_recurring, frequency, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, amount, beneficiaryAccountNumber, description, scheduledDate, isRecurring, frequency]
            );

            return {
                success: true,
                message: 'Virement programmé avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Generate unique reference
     * @returns {string} Reference
     */
    generateReference() {
        return 'TRF' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
}

module.exports = new TransferService();

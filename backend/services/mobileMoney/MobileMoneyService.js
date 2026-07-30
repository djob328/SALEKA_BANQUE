const db = require('../../config/database');
const axios = require('axios');

class MobileMoneyService {
    /**
     * Top up bank account from Mobile Money
     * @param {number} userId - User ID
     * @param {Object} topupData - Topup details
     * @returns {Promise<Object>} Topup result
     */
    async topUpAccount(userId, topupData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { amount, provider, phoneNumber, otp } = topupData;

            // Get user account
            const [accounts] = await connection.query(
                `SELECT * FROM accounts WHERE user_id = ? AND status = 'active' LIMIT 1`,
                [userId]
            );

            if (accounts.length === 0) {
                throw new Error('Aucun compte actif trouvé');
            }

            const account = accounts[0];

            // Process Mobile Money transaction
            const mmResult = await this.processMobileMoneyTransaction(provider, phoneNumber, amount, 'debit');

            if (!mmResult.success) {
                throw new Error('Échec de la transaction Mobile Money');
            }

            // Credit bank account
            const newBalance = parseFloat(account.balance) + amount;
            const newAvailable = parseFloat(account.available_balance) + amount;

            await connection.query(
                `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                [newBalance, newAvailable, account.id]
            );

            // Create transaction record
            await connection.query(
                `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                 VALUES (?, 'credit', ?, 'Alimentation Mobile Money', ?, ?)`,
                [account.id, amount, newBalance, this.generateReference()]
            );

            // Save Mobile Money transaction
            await connection.query(
                `INSERT INTO mobile_money_transactions 
                 (user_id, provider, phone_number, amount, type, status, reference, transaction_id) 
                 VALUES (?, ?, ?, ?, 'topup', 'completed', ?, ?)`,
                [userId, provider, phoneNumber, amount, this.generateReference(), mmResult.transactionId]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Alimentation effectuée avec succès',
                newBalance,
                transactionId: mmResult.transactionId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Withdraw from bank account to Mobile Money
     * @param {number} userId - User ID
     * @param {Object} withdrawalData - Withdrawal details
     * @returns {Promise<Object>} Withdrawal result
     */
    async withdrawToMobileMoney(userId, withdrawalData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { amount, provider, phoneNumber } = withdrawalData;

            // Get user account
            const [accounts] = await connection.query(
                `SELECT * FROM accounts WHERE user_id = ? AND status = 'active' LIMIT 1`,
                [userId]
            );

            if (accounts.length === 0) {
                throw new Error('Aucun compte actif trouvé');
            }

            const account = accounts[0];

            // Check sufficient balance
            if (parseFloat(account.available_balance) < amount) {
                throw new Error('Solde insuffisant');
            }

            // Debit bank account
            const newBalance = parseFloat(account.balance) - amount;
            const newAvailable = parseFloat(account.available_balance) - amount;

            await connection.query(
                `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                [newBalance, newAvailable, account.id]
            );

            // Process Mobile Money transaction
            const mmResult = await this.processMobileMoneyTransaction(provider, phoneNumber, amount, 'credit');

            if (!mmResult.success) {
                // Refund if Mobile Money fails
                await connection.query(
                    `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                    [account.balance, account.available_balance, account.id]
                );
                throw new Error('Échec de la transaction Mobile Money');
            }

            // Create transaction record
            await connection.query(
                `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                 VALUES (?, 'debit', ?, 'Retrait vers Mobile Money', ?, ?)`,
                [account.id, amount, newBalance, this.generateReference()]
            );

            // Save Mobile Money transaction
            await connection.query(
                `INSERT INTO mobile_money_transactions 
                 (user_id, provider, phone_number, amount, type, status, reference, transaction_id) 
                 VALUES (?, ?, ?, ?, 'withdrawal', 'completed', ?, ?)`,
                [userId, provider, phoneNumber, amount, this.generateReference(), mmResult.transactionId]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Retrait effectué avec succès',
                newBalance,
                transactionId: mmResult.transactionId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Pay bill via Mobile Money
     * @param {number} userId - User ID
     * @param {Object} billData - Bill payment details
     * @returns {Promise<Object>} Payment result
     */
    async payBill(userId, billData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { amount, provider, biller, billReference, phoneNumber } = billData;

            // Get user account
            const [accounts] = await connection.query(
                `SELECT * FROM accounts WHERE user_id = ? AND status = 'active' LIMIT 1`,
                [userId]
            );

            if (accounts.length === 0) {
                throw new Error('Aucun compte actif trouvé');
            }

            const account = accounts[0];

            // Check sufficient balance
            if (parseFloat(account.available_balance) < amount) {
                throw new Error('Solde insuffisant');
            }

            // Debit bank account
            const newBalance = parseFloat(account.balance) - amount;
            const newAvailable = parseFloat(account.available_balance) - amount;

            await connection.query(
                `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                [newBalance, newAvailable, account.id]
            );

            // Process bill payment
            const paymentResult = await this.processBillPayment(provider, biller, billReference, amount, phoneNumber);

            if (!paymentResult.success) {
                // Refund if payment fails
                await connection.query(
                    `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                    [account.balance, account.available_balance, account.id]
                );
                throw new Error('Échec du paiement de facture');
            }

            // Create transaction record
            await connection.query(
                `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                 VALUES (?, 'debit', ?, ?, ?, ?)`,
                [account.id, amount, `Paiement facture ${biller}`, newBalance, this.generateReference()]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Facture payée avec succès',
                transactionId: paymentResult.transactionId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get Mobile Money transaction history
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Transaction history
     */
    async getTransactionHistory(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM mobile_money_transactions 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT 20`,
                [userId]
            );

            return {
                success: true,
                transactions: rows.map(t => ({
                    id: t.id,
                    provider: t.provider,
                    phoneNumber: t.phone_number,
                    amount: parseFloat(t.amount),
                    type: t.type,
                    status: t.status,
                    transactionId: t.transaction_id,
                    createdAt: t.created_at
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Process Mobile Money transaction (mock implementation)
     * @param {string} provider - Provider (MTN/Orange)
     * @param {string} phoneNumber - Phone number
     * @param {number} amount - Amount
     * @param {string} type - Transaction type
     * @returns {Promise<Object>} Transaction result
     */
    async processMobileMoneyTransaction(provider, phoneNumber, amount, type) {
        // In production, this would call the actual MTN MoMo or Orange Money APIs
        // For now, we'll simulate the transaction
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock success
            return {
                success: true,
                transactionId: `${provider.toUpperCase()}${Date.now()}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process bill payment (mock implementation)
     * @param {string} provider - Provider
     * @param {string} biller - Biller
     * @param {string} billReference - Bill reference
     * @param {number} amount - Amount
     * @param {string} phoneNumber - Phone number
     * @returns {Promise<Object>} Payment result
     */
    async processBillPayment(provider, biller, billReference, amount, phoneNumber) {
        // In production, this would call the actual bill payment APIs
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                transactionId: `BILL${Date.now()}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate unique reference
     * @returns {string} Reference
     */
    generateReference() {
        return 'MM' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
}

module.exports = new MobileMoneyService();

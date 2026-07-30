const db = require('../../config/database');

class SavingsService {
    /**
     * Create savings account
     * @param {number} userId - User ID
     * @param {Object} savingsData - Savings account details
     * @returns {Promise<Object>} Creation result
     */
    async createSavingsAccount(userId, savingsData) {
        const connection = await db.getConnection();
        try {
            const { type, initialDeposit, goalAmount, goalName, targetDate } = savingsData;

            // Generate account number
            const accountNumber = this.generateAccountNumber();

            // Create savings account
            await connection.query(
                `INSERT INTO savings_accounts 
                 (user_id, account_number, type, balance, goal_amount, goal_name, target_date, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
                [userId, accountNumber, type, initialDeposit || 0, goalAmount, goalName, targetDate]
            );

            // If initial deposit, create transaction
            if (initialDeposit && initialDeposit > 0) {
                // Link to main account for debit
                const [mainAccounts] = await connection.query(
                    `SELECT id FROM accounts WHERE user_id = ? AND status = 'active' LIMIT 1`,
                    [userId]
                );

                if (mainAccounts.length > 0) {
                    await connection.query(
                        `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                         VALUES (?, 'debit', ?, 'Transfert vers épargne', ?, ?)`,
                        [mainAccounts[0].id, initialDeposit, 0, this.generateReference()]
                    );
                }
            }

            return {
                success: true,
                message: 'Compte épargne créé avec succès',
                accountNumber
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get savings accounts for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Savings accounts
     */
    async getSavingsAccounts(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM savings_accounts WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );

            return {
                success: true,
                accounts: rows.map(acc => ({
                    id: acc.id,
                    accountNumber: acc.account_number,
                    type: acc.type,
                    balance: parseFloat(acc.balance),
                    goalAmount: acc.goal_amount ? parseFloat(acc.goal_amount) : null,
                    goalName: acc.goal_name,
                    targetDate: acc.target_date,
                    status: acc.status,
                    createdAt: acc.created_at
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Deposit to savings account
     * @param {number} userId - User ID
     * @param {number} savingsAccountId - Savings account ID
     * @param {number} amount - Deposit amount
     * @returns {Promise<Object>} Deposit result
     */
    async deposit(userId, savingsAccountId, amount) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verify savings account belongs to user
            const [savingsAccounts] = await connection.query(
                `SELECT * FROM savings_accounts WHERE id = ? AND user_id = ?`,
                [savingsAccountId, userId]
            );

            if (savingsAccounts.length === 0) {
                throw new Error('Compte épargne introuvable');
            }

            const savingsAccount = savingsAccounts[0];

            // Get main account for debit
            const [mainAccounts] = await connection.query(
                `SELECT * FROM accounts WHERE user_id = ? AND status = 'active' LIMIT 1`,
                [userId]
            );

            if (mainAccounts.length === 0) {
                throw new Error('Aucun compte principal actif');
            }

            const mainAccount = mainAccounts[0];

            // Check sufficient balance
            if (parseFloat(mainAccount.available_balance) < amount) {
                throw new Error('Solde insuffisant sur le compte principal');
            }

            // Debit main account
            const newMainBalance = parseFloat(mainAccount.balance) - amount;
            const newMainAvailable = parseFloat(mainAccount.available_balance) - amount;

            await connection.query(
                `UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?`,
                [newMainBalance, newMainAvailable, mainAccount.id]
            );

            // Credit savings account
            const newSavingsBalance = parseFloat(savingsAccount.balance) + amount;

            await connection.query(
                `UPDATE savings_accounts SET balance = ? WHERE id = ?`,
                [newSavingsBalance, savingsAccountId]
            );

            // Create transaction records
            await connection.query(
                `INSERT INTO transactions (account_id, type, amount, description, balance_after, reference) 
                 VALUES (?, 'debit', ?, 'Transfert vers épargne', ?, ?)`,
                [mainAccount.id, amount, newMainBalance, this.generateReference()]
            );

            await connection.query(
                `INSERT INTO savings_transactions (savings_account_id, type, amount, balance_after, reference) 
                 VALUES (?, 'credit', ?, ?, ?)`,
                [savingsAccountId, amount, newSavingsBalance, this.generateReference()]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Dépôt effectué avec succès',
                newBalance: newSavingsBalance
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Set up automatic deposit
     * @param {number} userId - User ID
     * @param {Object} autoDepositData - Auto deposit details
     * @returns {Promise<Object>} Setup result
     */
    async setupAutoDeposit(userId, autoDepositData) {
        const connection = await db.getConnection();
        try {
            const { savingsAccountId, amount, frequency, dayOfMonth } = autoDepositData;

            // Verify savings account belongs to user
            const [savingsAccounts] = await connection.query(
                `SELECT id FROM savings_accounts WHERE id = ? AND user_id = ?`,
                [savingsAccountId, userId]
            );

            if (savingsAccounts.length === 0) {
                throw new Error('Compte épargne introuvable');
            }

            await connection.query(
                `INSERT INTO auto_deposits 
                 (user_id, savings_account_id, amount, frequency, day_of_month, status, next_deposit_date) 
                 VALUES (?, ?, ?, ?, ?, 'active', ?)`,
                [userId, savingsAccountId, amount, frequency, dayOfMonth, this.calculateNextDepositDate(frequency, dayOfMonth)]
            );

            return {
                success: true,
                message: 'Dépôt automatique configuré avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get savings goals progress
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Goals progress
     */
    async getGoalsProgress(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM savings_accounts WHERE user_id = ? AND goal_amount IS NOT NULL`,
                [userId]
            );

            return {
                success: true,
                goals: rows.map(acc => ({
                    id: acc.id,
                    goalName: acc.goal_name,
                    goalAmount: parseFloat(acc.goal_amount),
                    currentAmount: parseFloat(acc.balance),
                    progress: (parseFloat(acc.balance) / parseFloat(acc.goal_amount)) * 100,
                    targetDate: acc.target_date,
                    remaining: parseFloat(acc.goal_amount) - parseFloat(acc.balance)
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Generate savings account number
     * @returns {string} Account number
     */
    generateAccountNumber() {
        return 'EPG' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    /**
     * Generate unique reference
     * @returns {string} Reference
     */
    generateReference() {
        return 'EPG' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Calculate next deposit date based on frequency
     * @param {string} frequency - Frequency (monthly, weekly)
     * @param {number} dayOfMonth - Day of month
     * @returns {string} Next deposit date
     */
    calculateNextDepositDate(frequency, dayOfMonth) {
        const date = new Date();
        if (frequency === 'monthly') {
            date.setDate(dayOfMonth || 1);
            if (date < new Date()) {
                date.setMonth(date.getMonth() + 1);
            }
        } else if (frequency === 'weekly') {
            date.setDate(date.getDate() + 7);
        }
        return date.toISOString().split('T')[0];
    }
}

module.exports = new SavingsService();

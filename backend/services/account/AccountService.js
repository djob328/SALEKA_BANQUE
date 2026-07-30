const db = require('../../config/database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class AccountService {
    /**
     * Get account balance for a client
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Balance information
     */
    async getBalance(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT account_number, account_type, balance, available_balance, currency, iban 
                 FROM accounts 
                 WHERE user_id = ? AND status = 'active'`,
                [userId]
            );
            
            if (rows.length === 0) {
                throw new Error('Aucun compte actif trouvé');
            }
            
            return {
                success: true,
                accounts: rows.map(acc => ({
                    accountNumber: acc.account_number,
                    accountType: acc.account_type,
                    balance: parseFloat(acc.balance),
                    availableBalance: parseFloat(acc.available_balance),
                    currency: acc.currency,
                    iban: acc.iban
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get account transactions history
     * @param {number} userId - User ID
     * @param {number} limit - Number of transactions to return
     * @returns {Promise<Object>} Transactions list
     */
    async getTransactions(userId, limit = 10) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT t.*, a.account_number 
                 FROM transactions t
                 JOIN accounts a ON t.account_id = a.id
                 WHERE a.user_id = ?
                 ORDER BY t.created_at DESC
                 LIMIT ?`,
                [userId, limit]
            );
            
            return {
                success: true,
                transactions: rows.map(t => ({
                    id: t.id,
                    type: t.type,
                    amount: parseFloat(t.amount),
                    description: t.description,
                    date: t.created_at,
                    balanceAfter: parseFloat(t.balance_after),
                    accountNumber: t.account_number
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get all cards for a client
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Cards list
     */
    async getCards(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT c.*, a.account_number 
                 FROM cards c
                 JOIN accounts a ON c.account_id = a.id
                 WHERE a.user_id = ?`,
                [userId]
            );
            
            return {
                success: true,
                cards: rows.map(c => ({
                    id: c.id,
                    cardNumber: this.maskCardNumber(c.card_number),
                    cardType: c.card_type,
                    status: c.status,
                    expiryDate: c.expiry_date
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get credits for a client
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Credits list
     */
    async getCredits(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM credits WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );
            
            return {
                success: true,
                credits: rows.map(c => ({
                    id: c.id,
                    amount: parseFloat(c.amount),
                    duration: c.duration,
                    interestRate: parseFloat(c.interest_rate),
                    monthlyPayment: parseFloat(c.monthly_payment),
                    status: c.status,
                    remainingAmount: parseFloat(c.remaining_amount)
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get account limits
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Account limits
     */
    async getLimits(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT daily_transfer_limit, monthly_transfer_limit, daily_withdrawal_limit 
                 FROM accounts 
                 WHERE user_id = ? AND status = 'active'`,
                [userId]
            );
            
            if (rows.length === 0) {
                throw new Error('Aucun compte actif trouvé');
            }
            
            return {
                success: true,
                limits: {
                    dailyTransferLimit: parseFloat(rows[0].daily_transfer_limit),
                    monthlyTransferLimit: parseFloat(rows[0].monthly_transfer_limit),
                    dailyWithdrawalLimit: parseFloat(rows[0].daily_withdrawal_limit)
                }
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Mask card number for security
     * @param {string} cardNumber - Full card number
     * @returns {string} Masked card number
     */
    maskCardNumber(cardNumber) {
        if (!cardNumber) return '';
        return '**** **** **** ' + cardNumber.slice(-4);
    }
}

module.exports = new AccountService();

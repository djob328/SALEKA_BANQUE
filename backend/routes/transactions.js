const express = require('express');
const { authenticateToken, checkRole } = require('../middleware/auth');
const pool = require('../config/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get user's transactions
router.get('/', authenticateToken, async (req, res) => {
    console.log('[BACKEND] GET /api/transactions for user:', req.user.id);
    try {
        // Get user's account first
        const [accounts] = await pool.query(
            'SELECT id FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        console.log('[BACKEND] Accounts found for transactions:', accounts.length);

        if (accounts.length === 0) {
            console.log('[BACKEND] No account found for user:', req.user.id);
            return res.status(404).json([]);
        }

        const accountId = accounts[0].id;

        // Get transactions
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC',
            [accountId]
        );

        console.log('[BACKEND] Transactions found:', transactions.length);
        res.json(transactions);
    } catch (error) {
        console.error('[BACKEND] Get transactions error:', error);
        logger.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Create transaction (deposit/withdraw)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { transaction_type, amount, description } = req.body;

        if (!transaction_type || !amount) {
            return res.status(400).json({ error: 'Transaction type and amount are required' });
        }

        if (!['depot', 'retrait'].includes(transaction_type)) {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }

        // Get user's account
        const [accounts] = await pool.query(
            'SELECT id, balance FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const account = accounts[0];
        const currentBalance = parseFloat(account.balance);
        const transactionAmount = parseFloat(amount);

        // Check if sufficient balance for withdrawal
        if (transaction_type === 'retrait' && currentBalance < transactionAmount) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }

        // Calculate new balance
        const newBalance = transaction_type === 'depot' 
            ? currentBalance + transactionAmount 
            : currentBalance - transactionAmount;

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Insert transaction
            await pool.query(
                'INSERT INTO transactions (account_id, transaction_type, amount, description) VALUES (?, ?, ?, ?)',
                [account.id, transaction_type, transactionAmount, description || null]
            );

            // Update account balance
            await pool.query(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [newBalance, account.id]
            );

            await pool.query('COMMIT');

            res.json({
                message: 'Transaction successful',
                new_balance: newBalance
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Get transactions by account ID (for admin)
router.get('/account/:accountId', authenticateToken, async (req, res) => {
    try {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC',
            [req.params.accountId]
        );
        res.json(transactions);
    } catch (error) {
        logger.error('Get account transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Mobile Money topup
router.post('/mobile-money/topup', authenticateToken, async (req, res) => {
    try {
        const { provider, phoneNumber, amount } = req.body;

        if (!provider || !phoneNumber || !amount) {
            return res.status(400).json({ error: 'Provider, phone number and amount are required' });
        }

        if (!['orange_money', 'mtn_momo'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        const transactionAmount = parseFloat(amount);

        if (transactionAmount < 100) {
            return res.status(400).json({ error: 'Minimum amount is 100 FCFA' });
        }

        if (transactionAmount > 500000) {
            return res.status(400).json({ error: 'Maximum amount is 500 000 FCFA' });
        }

        // Get user's account
        const [accounts] = await pool.query(
            'SELECT id, balance FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const account = accounts[0];
        const currentBalance = parseFloat(account.balance);
        const newBalance = currentBalance + transactionAmount;

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Insert transaction
            await pool.query(
                'INSERT INTO transactions (account_id, user_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)',
                [account.id, req.user.id, 'depot', transactionAmount, `Alimentation ${provider} - ${phoneNumber}`]
            );

            // Update account balance
            await pool.query(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [newBalance, account.id]
            );

            await pool.query('COMMIT');

            res.json({
                message: 'Topup successful',
                new_balance: newBalance,
                provider,
                phoneNumber,
                amount: transactionAmount
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Mobile money topup error:', error);
        res.status(500).json({ error: 'Failed to process topup' });
    }
});

// Mobile Money withdrawal
router.post('/mobile-money/withdrawal', authenticateToken, async (req, res) => {
    try {
        const { provider, phoneNumber, amount } = req.body;

        if (!provider || !phoneNumber || !amount) {
            return res.status(400).json({ error: 'Provider, phone number and amount are required' });
        }

        if (!['orange_money', 'mtn_momo'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        const transactionAmount = parseFloat(amount);

        if (transactionAmount < 100) {
            return res.status(400).json({ error: 'Minimum amount is 100 FCFA' });
        }

        if (transactionAmount > 500000) {
            return res.status(400).json({ error: 'Maximum amount is 500 000 FCFA' });
        }

        // Get user's account
        const [accounts] = await pool.query(
            'SELECT id, balance FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const account = accounts[0];
        const currentBalance = parseFloat(account.balance);

        if (currentBalance < transactionAmount) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }

        const newBalance = currentBalance - transactionAmount;

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Insert transaction
            await pool.query(
                'INSERT INTO transactions (account_id, user_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)',
                [account.id, req.user.id, 'retrait', transactionAmount, `Retrait ${provider} - ${phoneNumber}`]
            );

            // Update account balance
            await pool.query(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [newBalance, account.id]
            );

            await pool.query('COMMIT');

            res.json({
                message: 'Withdrawal successful',
                new_balance: newBalance,
                provider,
                phoneNumber,
                amount: transactionAmount
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Mobile money withdrawal error:', error);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

// Get all transactions (admin)
router.get('/all', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [transactions] = await pool.query(
            'SELECT t.*, u.email, u.first_name, u.last_name, a.account_number FROM transactions t JOIN accounts a ON t.account_id = a.id JOIN users u ON a.user_id = u.id ORDER BY t.created_at DESC LIMIT ? OFFSET ?',
            [parseInt(limit), offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM transactions');

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        logger.error('Get all transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

module.exports = router;

const express = require('express');
const { authenticateToken, checkRole } = require('../middleware/auth');
const pool = require('../config/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get user's account
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [accounts] = await pool.query(
            'SELECT * FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json(null);
        }

        res.json(accounts[0]);
    } catch (error) {
        logger.error('Get account error:', error);
        res.status(500).json({ error: 'Failed to get account' });
    }
});

// Get all accounts (admin)
router.get('/all', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [accounts] = await pool.query(
            'SELECT a.*, u.email, u.first_name, u.last_name FROM accounts a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?',
            [parseInt(limit), offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM accounts');

        res.json({
            accounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        logger.error('Get all accounts error:', error);
        res.status(500).json({ error: 'Failed to get accounts' });
    }
});

// Create account for user
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { account_type = 'courant' } = req.body;

        // Generate account number
        const account_number = 'SALEKA' + Date.now().toString().slice(-10);

        const [result] = await pool.query(
            'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, 0.00)',
            [req.user.id, account_number, account_type]
        );

        res.status(201).json({
            message: 'Account created successfully',
            accountId: result.insertId,
            account_number
        });
    } catch (error) {
        logger.error('Create account error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

module.exports = router;

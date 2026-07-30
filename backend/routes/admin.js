const express = require('express');
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        // Get total clients (users with accounts or in clients table)
        const [totalClients] = await pool.query(`
            SELECT COUNT(DISTINCT u.id) as count
            FROM users u
            LEFT JOIN clients c ON u.id = c.user_id
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE (c.id IS NOT NULL OR a.id IS NOT NULL)
        `);

        // Get clients by status (including approved clients with accounts)
        const [clientsByStatus] = await pool.query(`
            SELECT 
                COALESCE(c.status, 'valide') as status,
                COUNT(DISTINCT u.id) as count
            FROM users u
            LEFT JOIN clients c ON u.id = c.user_id
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE (c.id IS NOT NULL OR a.id IS NOT NULL)
            GROUP BY COALESCE(c.status, 'valide')
        `);

        // Get total account applications
        const [totalApplications] = await pool.query('SELECT COUNT(*) as count FROM account_applications');

        // Get applications by status
        const [applicationsByStatus] = await pool.query(
            'SELECT status, COUNT(*) as count FROM account_applications GROUP BY status'
        );

        // Get total accounts
        const [totalAccounts] = await pool.query('SELECT COUNT(*) as count FROM accounts');

        // Get total balance across all accounts
        const [totalBalance] = await pool.query('SELECT SUM(balance) as total FROM accounts');

        // Get total transactions
        const [totalTransactions] = await pool.query('SELECT COUNT(*) as count FROM transactions');

        // Get today's transactions
        const [todayTransactions] = await pool.query(
            "SELECT COUNT(*) as count FROM transactions WHERE DATE(created_at) = CURDATE()"
        );

        // Get total appointments
        const [totalAppointments] = await pool.query('SELECT COUNT(*) as count FROM appointments');

        // Get today's appointments
        const [todayAppointments] = await pool.query(
            "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()"
        );

        // Get pending documents
        const [pendingDocuments] = await pool.query(
            "SELECT COUNT(*) as count FROM documents WHERE verification_status = 'pending'"
        );

        // Get agency statistics
        const [agencyStats] = await pool.query(
            `SELECT a.name, COUNT(ap.id) as appointment_count 
            FROM agencies a 
            LEFT JOIN appointments ap ON a.id = ap.agency_id AND ap.appointment_date = CURDATE()
            WHERE a.is_active = TRUE
            GROUP BY a.id, a.name`
        );

        res.json({
            totalClients: totalClients[0].count,
            clientsByStatus: clientsByStatus,
            totalApplications: totalApplications[0].count,
            applicationsByStatus: applicationsByStatus,
            totalAccounts: totalAccounts[0].count,
            totalBalance: totalBalance[0].total || 0,
            totalTransactions: totalTransactions[0].count,
            todayTransactions: todayTransactions[0].count,
            totalAppointments: totalAppointments[0].count,
            todayAppointments: todayAppointments[0].count,
            pendingDocuments: pendingDocuments[0].count,
            agencyStats
        });
    } catch (error) {
        logger.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard statistics' });
    }
});

// Get security logs
router.get('/security-logs', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50, action, status } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM security_logs WHERE 1=1';
        const params = [];

        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [logs] = await pool.query(query, params);

        res.json(logs);
    } catch (error) {
        logger.error('Get security logs error:', error);
        res.status(500).json({ error: 'Failed to get security logs' });
    }
});

// Get account types
router.get('/account-types', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const [accountTypes] = await pool.query(
            'SELECT * FROM account_types ORDER BY name'
        );

        res.json(accountTypes);
    } catch (error) {
        logger.error('Get account types error:', error);
        res.status(500).json({ error: 'Failed to get account types' });
    }
});

// Create account type
router.post('/account-types', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { name, description, min_balance, monthly_fee } = req.body;

        const [result] = await pool.query(
            'INSERT INTO account_types (name, description, min_balance, monthly_fee) VALUES (?, ?, ?, ?)',
            [name, description, min_balance, monthly_fee]
        );

        logger.info('Account type created', { accountTypeId: result.insertId, name });

        res.status(201).json({
            message: 'Account type created successfully',
            accountTypeId: result.insertId
        });
    } catch (error) {
        logger.error('Create account type error:', error);
        res.status(500).json({ error: 'Failed to create account type' });
    }
});

// Block/unblock user
router.patch('/users/:id/block', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { blocked } = req.body;

        const lockedUntil = blocked ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null; // Block for 1 year

        await pool.query(
            'UPDATE users SET locked_until = ? WHERE id = ?',
            [lockedUntil, req.params.id]
        );

        logger.info('User block status changed', { userId: req.params.id, blocked, adminId: req.user.id });

        res.json({ message: `User ${blocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
        logger.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to update user block status' });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');
const QRCode = require('qrcode');
const { logger } = require('../utils/logger');

const router = express.Router();

// Book appointment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { agency_id, appointment_date, appointment_time } = req.body;

        if (!agency_id || !appointment_date || !appointment_time) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get client ID
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client profile not found' });
        }

        const clientId = clients[0].id;

        // Check if agency exists and is active
        const [agencies] = await pool.query(
            'SELECT max_daily_appointments FROM agencies WHERE id = ? AND is_active = TRUE',
            [agency_id]
        );

        if (agencies.length === 0) {
            return res.status(404).json({ error: 'Agency not found or inactive' });
        }

        // Check if appointment slot is available
        const [existingAppointments] = await pool.query(
            'SELECT COUNT(*) as count FROM appointments WHERE agency_id = ? AND appointment_date = ? AND status != ?',
            [agency_id, appointment_date, 'cancelled']
        );

        if (existingAppointments[0].count >= agencies[0].max_daily_appointments) {
            return res.status(409).json({ error: 'No available slots for this date' });
        }

        // Get queue number
        const [queueResult] = await pool.query(
            'SELECT COUNT(*) as count FROM appointments WHERE agency_id = ? AND appointment_date = ?',
            [agency_id, appointment_date]
        );

        const queueNumber = queueResult[0].count + 1;

        // Generate QR code
        const qrData = JSON.stringify({
            appointmentId: null,
            clientId,
            agencyId: agency_id,
            date: appointment_date,
            time: appointment_time,
            queueNumber
        });

        const qrCode = await QRCode.toDataURL(qrData);

        // Insert appointment
        const [result] = await pool.query(
            `INSERT INTO appointments 
            (client_id, agency_id, appointment_date, appointment_time, queue_number, qr_code, status)
            VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
            [clientId, agency_id, appointment_date, appointment_time, queueNumber, qrCode]
        );

        logger.info('Appointment booked', { 
            appointmentId: result.insertId, 
            clientId, 
            agencyId: agency_id,
            date: appointment_date 
        });

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointmentId: result.insertId,
            queueNumber,
            qrCode
        });
    } catch (error) {
        logger.error('Book appointment error:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Get client appointments
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client profile not found' });
        }

        const [appointments] = await pool.query(
            `SELECT a.*, ag.name as agency_name, ag.address as agency_address 
            FROM appointments a 
            JOIN agencies ag ON a.agency_id = ag.id 
            WHERE a.client_id = ? 
            ORDER BY a.appointment_date DESC`,
            [clients[0].id]
        );

        res.json(appointments);
    } catch (error) {
        logger.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to get appointments' });
    }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [appointments] = await pool.query(
            `SELECT a.*, ag.name as agency_name, ag.address as agency_address, ag.phone as agency_phone
            FROM appointments a 
            JOIN agencies ag ON a.agency_id = ag.id 
            WHERE a.id = ?`,
            [req.params.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Verify ownership
        const [clients] = await pool.query(
            'SELECT user_id FROM clients WHERE id = ?',
            [appointments[0].client_id]
        );

        if (clients[0].user_id !== req.user.id && !['admin', 'super_admin', 'agent'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(appointments[0]);
    } catch (error) {
        logger.error('Get appointment error:', error);
        res.status(500).json({ error: 'Failed to get appointment' });
    }
});

// Cancel appointment
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const [appointments] = await pool.query(
            'SELECT client_id FROM appointments WHERE id = ?',
            [req.params.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Verify ownership
        const [clients] = await pool.query(
            'SELECT user_id FROM clients WHERE id = ?',
            [appointments[0].client_id]
        );

        if (clients[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await pool.query(
            'UPDATE appointments SET status = ? WHERE id = ?',
            ['cancelled', req.params.id]
        );

        logger.info('Appointment cancelled', { appointmentId: req.params.id, userId: req.user.id });

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        logger.error('Cancel appointment error:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

// Admin: Get agency appointments
router.get('/agency/:agencyId', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;

        let query = `
            SELECT a.*, c.first_name, c.last_name, c.phone 
            FROM appointments a 
            JOIN clients c ON a.client_id = c.id 
            WHERE a.agency_id = ?
        `;
        const params = [req.params.agencyId];

        if (date) {
            query += ' AND a.appointment_date = ?';
            params.push(date);
        }

        query += ' ORDER BY a.appointment_date, a.appointment_time';

        const [appointments] = await pool.query(query, params);

        res.json(appointments);
    } catch (error) {
        logger.error('Get agency appointments error:', error);
        res.status(500).json({ error: 'Failed to get agency appointments' });
    }
});

// Get all appointments (admin)
router.get('/all', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [appointments] = await pool.query(
            `SELECT a.*, c.first_name, c.last_name, c.email, ag.name as agency_name 
            FROM appointments a 
            JOIN clients c ON a.client_id = c.id 
            LEFT JOIN agencies ag ON a.agency_id = ag.id 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC 
            LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM appointments');

        res.json({
            appointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        logger.error('Get all appointments error:', error);
        res.status(500).json({ error: 'Failed to get appointments' });
    }
});

module.exports = router;

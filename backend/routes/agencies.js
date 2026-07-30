const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get all agencies
router.get('/', async (req, res) => {
    try {
        const [agencies] = await pool.query(
            'SELECT * FROM agencies WHERE is_active = TRUE ORDER BY name'
        );

        res.json(agencies);
    } catch (error) {
        logger.error('Get agencies error:', error);
        res.status(500).json({ error: 'Failed to get agencies' });
    }
});

// Get agency by ID
router.get('/:id', async (req, res) => {
    try {
        const [agencies] = await pool.query(
            'SELECT * FROM agencies WHERE id = ?',
            [req.params.id]
        );

        if (agencies.length === 0) {
            return res.status(404).json({ error: 'Agency not found' });
        }

        // Get today's appointment count
        const [appointmentCount] = await pool.query(
            'SELECT COUNT(*) as count FROM appointments WHERE agency_id = ? AND appointment_date = CURDATE() AND status != ?',
            [req.params.id, 'cancelled']
        );

        const agency = agencies[0];
        agency.today_appointments = appointmentCount[0].count;
        agency.available_slots = agency.max_daily_appointments - appointmentCount[0].count;

        res.json(agency);
    } catch (error) {
        logger.error('Get agency error:', error);
        res.status(500).json({ error: 'Failed to get agency' });
    }
});

// Get nearby agencies (requires lat/lng)
router.get('/nearby/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const { radius = 10 } = req.query; // radius in km

        const [agencies] = await pool.query(
            `SELECT *, 
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(latitude)))) AS distance
            FROM agencies 
            WHERE is_active = TRUE
            HAVING distance < ?
            ORDER BY distance`,
            [lat, lng, lat, radius]
        );

        res.json(agencies);
    } catch (error) {
        logger.error('Get nearby agencies error:', error);
        res.status(500).json({ error: 'Failed to get nearby agencies' });
    }
});

// Admin: Create agency
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            name,
            address,
            latitude,
            longitude,
            phone,
            email,
            opening_hours,
            services,
            max_daily_appointments
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO agencies 
            (name, address, latitude, longitude, phone, email, opening_hours, services, max_daily_appointments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, address, latitude, longitude, phone, email, JSON.stringify(opening_hours), JSON.stringify(services), max_daily_appointments]
        );

        logger.info('Agency created', { agencyId: result.insertId, name });

        res.status(201).json({
            message: 'Agency created successfully',
            agencyId: result.insertId
        });
    } catch (error) {
        logger.error('Create agency error:', error);
        res.status(500).json({ error: 'Failed to create agency' });
    }
});

// Admin: Update agency
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const {
            name,
            address,
            latitude,
            longitude,
            phone,
            email,
            opening_hours,
            services,
            max_daily_appointments,
            is_active
        } = req.body;

        await pool.query(
            `UPDATE agencies 
            SET name = ?, address = ?, latitude = ?, longitude = ?, phone = ?, email = ?, 
                opening_hours = ?, services = ?, max_daily_appointments = ?, is_active = ?
            WHERE id = ?`,
            [name, address, latitude, longitude, phone, email, JSON.stringify(opening_hours), JSON.stringify(services), max_daily_appointments, is_active, req.params.id]
        );

        logger.info('Agency updated', { agencyId: req.params.id });

        res.json({ message: 'Agency updated successfully' });
    } catch (error) {
        logger.error('Update agency error:', error);
        res.status(500).json({ error: 'Failed to update agency' });
    }
});

// Admin: Delete agency
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM agencies WHERE id = ?', [req.params.id]);

        logger.info('Agency deleted', { agencyId: req.params.id });

        res.json({ message: 'Agency deleted successfully' });
    } catch (error) {
        logger.error('Delete agency error:', error);
        res.status(500).json({ error: 'Failed to delete agency' });
    }
});

module.exports = router;

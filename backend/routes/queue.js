const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Join queue
router.post('/join', authenticateToken, async (req, res) => {
    try {
        const { agency_id } = req.body;

        if (!agency_id) {
            return res.status(400).json({ error: 'Agency ID is required' });
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

        // Check if client is already in queue
        const [existingQueue] = await pool.query(
            'SELECT id FROM queue_entries WHERE client_id = ? AND status = ?',
            [clientId, 'waiting']
        );

        if (existingQueue.length > 0) {
            return res.status(409).json({ error: 'Client is already in queue' });
        }

        // Get next queue number
        const [queueResult] = await pool.query(
            'SELECT MAX(queue_number) as max_queue FROM queue_entries WHERE agency_id = ? AND DATE(entered_at) = CURDATE()',
            [agency_id]
        );

        const queueNumber = (queueResult[0].max_queue || 0) + 1;

        // Estimate wait time (5 minutes per person)
        const [waitingCount] = await pool.query(
            'SELECT COUNT(*) as count FROM queue_entries WHERE agency_id = ? AND status = ? AND DATE(entered_at) = CURDATE()',
            [agency_id, 'waiting']
        );

        const estimatedWaitTime = waitingCount[0].count * 5;

        // Insert into queue
        const [result] = await pool.query(
            'INSERT INTO queue_entries (agency_id, client_id, queue_number, status, estimated_wait_time) VALUES (?, ?, ?, ?, ?)',
            [agency_id, clientId, queueNumber, 'waiting', estimatedWaitTime]
        );

        logger.info('Client joined queue', { queueId: result.insertId, clientId, agencyId, queueNumber });

        res.status(201).json({
            message: 'Joined queue successfully',
            queueId: result.insertId,
            queueNumber,
            estimatedWaitTime
        });
    } catch (error) {
        logger.error('Join queue error:', error);
        res.status(500).json({ error: 'Failed to join queue' });
    }
});

// Get queue status
router.get('/status/:agencyId', async (req, res) => {
    try {
        const [queueEntries] = await pool.query(
            `SELECT q.*, c.first_name, c.last_name 
            FROM queue_entries q 
            JOIN clients c ON q.client_id = c.id 
            WHERE q.agency_id = ? AND DATE(q.entered_at) = CURDATE()
            ORDER BY q.queue_number`,
            [req.params.agencyId]
        );

        // Calculate statistics
        const waiting = queueEntries.filter(q => q.status === 'waiting').length;
        const serving = queueEntries.filter(q => q.status === 'serving').length;
        const completed = queueEntries.filter(q => q.status === 'completed').length;

        res.json({
            queue: queueEntries,
            statistics: {
                waiting,
                serving,
                completed,
                total: queueEntries.length
            }
        });
    } catch (error) {
        logger.error('Get queue status error:', error);
        res.status(500).json({ error: 'Failed to get queue status' });
    }
});

// Get client queue position
router.get('/my-position', authenticateToken, async (req, res) => {
    try {
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client profile not found' });
        }

        const [queueEntry] = await pool.query(
            'SELECT * FROM queue_entries WHERE client_id = ? AND status = ? ORDER BY entered_at DESC LIMIT 1',
            [clients[0].id, 'waiting']
        );

        if (queueEntry.length === 0) {
            return res.status(404).json({ error: 'Not in queue' });
        }

        // Get position in queue
        const [position] = await pool.query(
            'SELECT COUNT(*) as count FROM queue_entries WHERE agency_id = ? AND queue_number < ? AND status = ? AND DATE(entered_at) = CURDATE()',
            [queueEntry[0].agency_id, queueEntry[0].queue_number, 'waiting']
        );

        res.json({
            ...queueEntry[0],
            position: position[0].count + 1
        });
    } catch (error) {
        logger.error('Get queue position error:', error);
        res.status(500).json({ error: 'Failed to get queue position' });
    }
});

// Leave queue
router.delete('/leave', authenticateToken, async (req, res) => {
    try {
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client profile not found' });
        }

        await pool.query(
            'UPDATE queue_entries SET status = ? WHERE client_id = ? AND status = ?',
            ['skipped', clients[0].id, 'waiting']
        );

        logger.info('Client left queue', { clientId: clients[0].id });

        res.json({ message: 'Left queue successfully' });
    } catch (error) {
        logger.error('Leave queue error:', error);
        res.status(500).json({ error: 'Failed to leave queue' });
    }
});

// Admin: Serve next in queue
router.post('/serve/:agencyId', authenticateToken, async (req, res) => {
    try {
        // Get next waiting customer
        const [nextCustomer] = await pool.query(
            'SELECT * FROM queue_entries WHERE agency_id = ? AND status = ? ORDER BY queue_number ASC LIMIT 1',
            [req.params.agencyId, 'waiting']
        );

        if (nextCustomer.length === 0) {
            return res.status(404).json({ error: 'No customers waiting in queue' });
        }

        // Update status to serving
        await pool.query(
            'UPDATE queue_entries SET status = ?, started_at = NOW() WHERE id = ?',
            ['serving', nextCustomer[0].id]
        );

        logger.info('Next customer served', { queueId: nextCustomer[0].id, agencyId: req.params.agencyId });

        res.json({
            message: 'Next customer served',
            customer: nextCustomer[0]
        });
    } catch (error) {
        logger.error('Serve next customer error:', error);
        res.status(500).json({ error: 'Failed to serve next customer' });
    }
});

// Admin: Complete queue entry
router.patch('/complete/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'UPDATE queue_entries SET status = ?, completed_at = NOW() WHERE id = ?',
            ['completed', req.params.id]
        );

        logger.info('Queue entry completed', { queueId: req.params.id });

        res.json({ message: 'Queue entry completed successfully' });
    } catch (error) {
        logger.error('Complete queue entry error:', error);
        res.status(500).json({ error: 'Failed to complete queue entry' });
    }
});

module.exports = router;

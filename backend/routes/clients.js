const express = require('express');
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { logger } = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuration de multer pour le stockage des images CNI
const cniStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/cni');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cni-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const cniUpload = multer({
    storage: cniStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers JPEG, PNG, WebP et PDF sont autorisés'));
        }
    }
});

// Configuration pour les documents multiples
const documentsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const documentsUpload = multer({
    storage: documentsStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max per file
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers JPEG, PNG, WebP et PDF sont autorisés'));
        }
    }
});

// Create client profile
router.post('/', authenticateToken, documentsUpload.fields([
    { name: 'cni_recto', maxCount: 1 },
    { name: 'cni_verso', maxCount: 1 },
    { name: 'passeport', maxCount: 1 },
    { name: 'justificatif_domicile', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            date_of_birth,
            sex,
            nationality,
            address,
            city,
            profession,
            income,
            cni_number,
            passport_number,
            account_type
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth || !sex || !address || !account_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if client profile already exists
        const [existing] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Client profile already exists' });
        }

        // Check for duplicate CNI
        if (cni_number) {
            const [duplicateCNI] = await pool.query(
                'SELECT id FROM clients WHERE cni_number = ?',
                [cni_number]
            );

            if (duplicateCNI.length > 0) {
                return res.status(409).json({ error: 'CNI number already registered' });
            }
        }

        // Insert client
        const [result] = await pool.query(
            `INSERT INTO clients 
            (user_id, first_name, last_name, date_of_birth, sex, nationality, address, city, profession, income, cni_number, passport_number, account_type, cni_recto_path, cni_verso_path, passeport_path, justificatif_domicile_path, signature_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, 
                first_name, 
                last_name, 
                date_of_birth, 
                sex, 
                nationality, 
                address, 
                city, 
                profession, 
                income, 
                cni_number, 
                passport_number, 
                account_type,
                req.files?.cni_recto?.[0]?.path || null,
                req.files?.cni_verso?.[0]?.path || null,
                req.files?.passeport?.[0]?.path || null,
                req.files?.justificatif_domicile?.[0]?.path || null,
                req.files?.signature?.[0]?.path || null
            ]
        );

        logger.info('Client profile created', { clientId: result.insertId, userId: req.user.id, accountType: account_type });

        res.status(201).json({
            message: 'Client profile created successfully',
            clientId: result.insertId
        });
    } catch (error) {
        logger.error('Create client error:', error);
        res.status(500).json({ error: 'Failed to create client profile' });
    }
});

// Get client profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [profiles] = await pool.query(
            'SELECT * FROM profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (profiles.length === 0) {
            return res.json(null);
        }

        res.json(profiles[0]);
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update client profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const {
            date_of_birth,
            address,
            nationality,
            profession
        } = req.body;

        // Check if profile exists
        const [existing] = await pool.query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [req.user.id]
        );

        if (existing.length > 0) {
            // Update existing profile
            await pool.query(
                'UPDATE profiles SET date_of_birth = ?, address = ?, nationality = ?, profession = ? WHERE user_id = ?',
                [date_of_birth || null, address || null, nationality || null, profession || null, req.user.id]
            );
        } else {
            // Create new profile
            await pool.query(
                'INSERT INTO profiles (user_id, date_of_birth, address, nationality, profession) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, date_of_birth || null, address || null, nationality || null, profession || null]
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get client status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const [clients] = await pool.query(
            'SELECT status, created_at FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client profile not found' });
        }

        const client = clients[0];

        // Get document status
        const [documents] = await pool.query(
            'SELECT document_type, verification_status FROM documents WHERE client_id = ?',
            [client.id]
        );

        // Get appointment status
        const [appointments] = await pool.query(
            'SELECT appointment_date, appointment_time, status FROM appointments WHERE client_id = ? ORDER BY appointment_date DESC LIMIT 1',
            [client.id]
        );

        res.json({
            status: client.status,
            createdAt: client.created_at,
            documents: documents,
            appointment: appointments[0] || null
        });
    } catch (error) {
        logger.error('Get client status error:', error);
        res.status(500).json({ error: 'Failed to get client status' });
    }
});

// Admin: Get all clients
router.get('/all', authenticateToken, checkRole('admin', 'super_admin', 'agent'), async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const offset = (page - 1) * limit;

        // Get users with accounts (approved clients) and traditional clients
        let query = `
            SELECT DISTINCT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.role,
                u.created_at,
                COALESCE(c.status, 'valide') as status,
                COALESCE(c.cni_number, '') as cni_number
            FROM users u
            LEFT JOIN clients c ON u.id = c.user_id
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE (c.id IS NOT NULL OR a.id IS NOT NULL)
        `;
        const params = [];

        if (search) {
            query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR c.cni_number LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            query += ' AND COALESCE(c.status, "valide") = ?';
            params.push(status);
        }

        query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [clients] = await pool.query(query, params);

        // Get accounts for each client
        for (const client of clients) {
            const [accounts] = await pool.query(
                'SELECT * FROM accounts WHERE user_id = ?',
                [client.user_id]
            );
            client.accounts = accounts;
        }

        // Get total count
        let countQuery = `
            SELECT COUNT(DISTINCT u.id) as total
            FROM users u
            LEFT JOIN clients c ON u.id = c.user_id
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE (c.id IS NOT NULL OR a.id IS NOT NULL)
        `;
        const countParams = [];

        if (search) {
            countQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR c.cni_number LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            countQuery += ' AND COALESCE(c.status, "valide") = ?';
            countParams.push(status);
        }

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            clients,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        logger.error('Get all clients error:', error);
        res.status(500).json({ error: 'Failed to get clients' });
    }
});

// Admin: Update client status
router.patch('/:id/status', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['en_attente', 'verification_en_cours', 'valide', 'rejete', 'complement_demande'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.query(
            'UPDATE clients SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        logger.info('Client status updated', { clientId: req.params.id, status, adminId: req.user.id });

        res.json({ message: 'Client status updated successfully' });
    } catch (error) {
        logger.error('Update client status error:', error);
        res.status(500).json({ error: 'Failed to update client status' });
    }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Log toutes les requêtes sur ce routeur
router.use((req, res, next) => {
    console.log(`[AccountApplications] ${req.method} ${req.originalUrl}`);
    console.log(`[AccountApplications] Params:`, req.params);
    console.log(`[AccountApplications] Body:`, req.body);
    next();
});

// Configuration de multer pour les documents
const documentsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/account-applications');
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

// Generate unique reference
const generateReference = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `APP-${year}-${random}`;
};

// Create or update account application
router.post('/', authenticateToken, documentsUpload.fields([
    { name: 'cni_recto', maxCount: 1 },
    { name: 'cni_verso', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'photo_identite', maxCount: 1 },
    { name: 'justificatif_domicile', maxCount: 1 },
    { name: 'bulletin_salaire', maxCount: 1 },
    { name: 'registre_commerce', maxCount: 1 },
    { name: 'carte_contribuable', maxCount: 1 },
    { name: 'attestation_travail', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            account_type,
            sex,
            date_of_birth,
            place_of_birth,
            nationality,
            phone,
            email,
            address,
            country,
            region,
            city,
            neighborhood,
            profession,
            employer,
            monthly_income,
            income_source,
            terms_accepted,
            privacy_accepted
        } = req.body;

        // Validate required fields
        if (!account_type || !sex || !date_of_birth || !nationality) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already has an application
        const [existing] = await pool.query(
            'SELECT id, reference, status FROM account_applications WHERE user_id = ?',
            [req.user.id]
        );

        let applicationId;
        let reference;

        if (existing.length > 0) {
            // Update existing application
            applicationId = existing[0].id;
            reference = existing[0].reference;

            await pool.query(
                `UPDATE account_applications SET
                    account_type = ?,
                    sex = ?,
                    date_of_birth = ?,
                    place_of_birth = ?,
                    nationality = ?,
                    phone = ?,
                    email = ?,
                    address = ?,
                    country = ?,
                    region = ?,
                    city = ?,
                    neighborhood = ?,
                    profession = ?,
                    employer = ?,
                    monthly_income = ?,
                    income_source = ?,
                    terms_accepted = ?,
                    privacy_accepted = ?,
                    cni_recto_path = COALESCE(?, cni_recto_path),
                    cni_verso_path = COALESCE(?, cni_verso_path),
                    passport_path = COALESCE(?, passport_path),
                    photo_identite_path = COALESCE(?, photo_identite_path),
                    justificatif_domicile_path = COALESCE(?, justificatif_domicile_path),
                    bulletin_salaire_path = COALESCE(?, bulletin_salaire_path),
                    registre_commerce_path = COALESCE(?, registre_commerce_path),
                    carte_contribuable_path = COALESCE(?, carte_contribuable_path),
                    attestation_travail_path = COALESCE(?, attestation_travail_path),
                    selfie_path = COALESCE(?, selfie_path),
                    signature_path = COALESCE(?, signature_path),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    account_type,
                    sex,
                    date_of_birth,
                    place_of_birth,
                    nationality,
                    phone,
                    email,
                    address,
                    country,
                    region,
                    city,
                    neighborhood,
                    profession,
                    employer,
                    monthly_income,
                    income_source,
                    terms_accepted === 'true',
                    privacy_accepted === 'true',
                    req.files?.cni_recto?.[0]?.path || null,
                    req.files?.cni_verso?.[0]?.path || null,
                    req.files?.passport?.[0]?.path || null,
                    req.files?.photo_identite?.[0]?.path || null,
                    req.files?.justificatif_domicile?.[0]?.path || null,
                    req.files?.bulletin_salaire?.[0]?.path || null,
                    req.files?.registre_commerce?.[0]?.path || null,
                    req.files?.carte_contribuable?.[0]?.path || null,
                    req.files?.attestation_travail?.[0]?.path || null,
                    req.files?.selfie?.[0]?.path || null,
                    req.files?.signature?.[0]?.path || null,
                    applicationId
                ]
            );
        } else {
            // Create new application
            reference = generateReference();
            const [result] = await pool.query(
                `INSERT INTO account_applications (
                    user_id, reference, account_type, sex, date_of_birth, place_of_birth, nationality,
                    phone, email, address, country, region, city, neighborhood, profession, employer,
                    monthly_income, income_source, terms_accepted, privacy_accepted,
                    cni_recto_path, cni_verso_path, passport_path, photo_identite_path,
                    justificatif_domicile_path, bulletin_salaire_path, registre_commerce_path,
                    carte_contribuable_path, attestation_travail_path, selfie_path, signature_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.id,
                    reference,
                    account_type,
                    sex,
                    date_of_birth,
                    place_of_birth,
                    nationality,
                    phone,
                    email,
                    address,
                    country,
                    region,
                    city,
                    neighborhood,
                    profession,
                    employer,
                    monthly_income,
                    income_source,
                    terms_accepted === 'true',
                    privacy_accepted === 'true',
                    req.files?.cni_recto?.[0]?.path || null,
                    req.files?.cni_verso?.[0]?.path || null,
                    req.files?.passport?.[0]?.path || null,
                    req.files?.photo_identite?.[0]?.path || null,
                    req.files?.justificatif_domicile?.[0]?.path || null,
                    req.files?.bulletin_salaire?.[0]?.path || null,
                    req.files?.registre_commerce?.[0]?.path || null,
                    req.files?.carte_contribuable?.[0]?.path || null,
                    req.files?.attestation_travail?.[0]?.path || null,
                    req.files?.selfie?.[0]?.path || null,
                    req.files?.signature?.[0]?.path || null
                ]
            );
            applicationId = result.insertId;
        }

        res.json({
            message: existing.length > 0 ? 'Application updated successfully' : 'Application created successfully',
            applicationId,
            reference
        });
    } catch (error) {
        logger.error('Create/Update application error:', error);
        res.status(500).json({ error: 'Failed to save application' });
    }
});

// Submit application
router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
        const [applications] = await pool.query(
            'SELECT * FROM account_applications WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = applications[0];

        // Calculate completion percentage
        let completed = 0;
        const total = 10;
        
        if (application.sex) completed++;
        if (application.date_of_birth) completed++;
        if (application.nationality) completed++;
        if (application.address) completed++;
        if (application.profession) completed++;
        if (application.cni_recto_path) completed++;
        if (application.cni_verso_path) completed++;
        if (application.photo_identite_path) completed++;
        if (application.justificatif_domicile_path) completed++;
        if (application.selfie_path) completed++;

        const completionPercentage = Math.round((completed / total) * 100);

        await pool.query(
            `UPDATE account_applications SET
                status = 'soumis',
                submitted_at = CURRENT_TIMESTAMP,
                completion_percentage = ?
            WHERE id = ?`,
            [completionPercentage, req.params.id]
        );

        res.json({ message: 'Application submitted successfully', completionPercentage });
    } catch (error) {
        logger.error('Submit application error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Get user's application
router.get('/my-application', authenticateToken, async (req, res) => {
    try {
        const [applications] = await pool.query(
            'SELECT * FROM account_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [req.user.id]
        );

        if (applications.length === 0) {
            return res.json(null);
        }

        res.json(applications[0]);
    } catch (error) {
        logger.error('Get application error:', error);
        res.status(500).json({ error: 'Failed to get application' });
    }
});

// Admin: Get all applications
router.get('/all', authenticateToken, checkRole('admin', 'super_admin', 'agent'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT aa.*, u.first_name, u.last_name, u.email 
            FROM account_applications aa 
            JOIN users u ON aa.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND aa.status = ?';
            params.push(status);
        }

        query += ' ORDER BY aa.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [applications] = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM account_applications aa WHERE 1=1';
        const countParams = [];

        if (status) {
            countQuery += ' AND aa.status = ?';
            countParams.push(status);
        }

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            applications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        logger.error('Get all applications error:', error);
        res.status(500).json({ error: 'Failed to get applications' });
    }
});

// Admin: Schedule appointment for application verification
router.post('/:id/schedule-appointment', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        console.log('=== SCHEDULE APPOINTMENT DEBUG ===');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        
        const { agency_id, appointment_date, appointment_time } = req.body;

        if (!agency_id || !appointment_date || !appointment_time) {
            console.log('[SCHEDULE] Missing required fields');
            return res.status(400).json({ error: 'Agency, date and time are required' });
        }

        console.log('[SCHEDULE] Fetching application with ID:', req.params.id);
        const [applications] = await pool.query(
            'SELECT aa.*, u.first_name, u.last_name, u.email, u.phone FROM account_applications aa JOIN users u ON aa.user_id = u.id WHERE aa.id = ?',
            [req.params.id]
        );

        if (applications.length === 0) {
            console.log('[SCHEDULE] Application not found');
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = applications[0];
        console.log('[SCHEDULE] Application found:', application.id);
        console.log('[SCHEDULE] Application phone:', application.phone);

        // Get client ID
        console.log('[SCHEDULE] Fetching client for user_id:', application.user_id);
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [application.user_id]
        );

        let clientId;
        if (clients.length === 0) {
            console.log('[SCHEDULE] Client profile not found, creating one');
            // Create client profile automatically
            const [result] = await pool.query(
                `INSERT INTO clients (user_id, status, created_at) VALUES (?, 'active', CURRENT_TIMESTAMP)`,
                [application.user_id]
            );
            clientId = result.insertId;
            console.log('[SCHEDULE] Client profile created with ID:', clientId);
        } else {
            clientId = clients[0].id;
            console.log('[SCHEDULE] Client ID:', clientId);
        }

        // Check if agency exists and is active
        console.log('[SCHEDULE] Checking agency with ID:', agency_id);
        const [agencies] = await pool.query(
            'SELECT max_daily_appointments FROM agencies WHERE id = ? AND is_active = TRUE',
            [agency_id]
        );

        if (agencies.length === 0) {
            console.log('[SCHEDULE] Agency not found or inactive');
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
            'SELECT MAX(queue_number) as max_queue FROM appointments WHERE agency_id = ? AND appointment_date = ?',
            [agency_id, appointment_date]
        );
        const queueNumber = (queueResult[0].max_queue || 0) + 1;

        // Create appointment
        console.log('[SCHEDULE] Creating appointment...');
        const [result] = await pool.query(
            `INSERT INTO appointments (client_id, agency_id, appointment_date, appointment_time, queue_number, status) 
            VALUES (?, ?, ?, ?, ?, 'confirmed')`,
            [clientId, agency_id, appointment_date, appointment_time, queueNumber]
        );
        console.log('[SCHEDULE] Appointment created with ID:', result.insertId);

        // Update application status
        console.log('[SCHEDULE] Updating application status...');
        await pool.query(
            `UPDATE account_applications SET
                status = 'approuve',
                approved_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [req.params.id]
        );
        console.log('[SCHEDULE] Application status updated');

        // Create bank account
        console.log('[SCHEDULE] Creating bank account...');
        const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        await pool.query(
            'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, 0)',
            [application.user_id, accountNumber.toString(), application.account_type]
        );
        console.log('[SCHEDULE] Bank account created:', accountNumber);

        // Send WhatsApp notification
        console.log('[SCHEDULE] Sending WhatsApp notification...');
        try {
            const whatsappService = require('../services/smsService');
            await whatsappService.sendAppointmentConfirmation(
                application.phone,
                `${application.first_name} ${application.last_name}`,
                appointment_date,
                appointment_time,
                queueNumber
            );
            console.log('[SCHEDULE] WhatsApp notification sent successfully');
        } catch (whatsappError) {
            console.error('[SCHEDULE] WhatsApp notification error:', whatsappError);
            // Continue even if WhatsApp fails
        }

        logger.info('Appointment scheduled and account created', { 
            applicationId: req.params.id, 
            userId: application.user_id,
            accountNumber,
            appointmentDate: appointment_date,
            appointmentTime: appointment_time
        });

        res.json({ 
            message: 'Appointment scheduled and account created successfully',
            appointmentId: result.insertId,
            queueNumber,
            accountNumber
        });
    } catch (error) {
        logger.error('Schedule appointment error:', error);
        res.status(500).json({ error: 'Failed to schedule appointment' });
    }
});

// Admin: Approve application
router.post('/:id/approve', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const [applications] = await pool.query(
            'SELECT * FROM account_applications WHERE id = ?',
            [req.params.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = applications[0];

        // Update application status to en_cours_verification (awaiting appointment)
        await pool.query(
            `UPDATE account_applications SET
                status = 'en_cours_verification',
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [req.params.id]
        );

        logger.info('Application approved, awaiting appointment', { 
            applicationId: req.params.id, 
            userId: application.user_id 
        });

        res.json({ message: 'Application approved. Please schedule an appointment for verification.' });
    } catch (error) {
        logger.error('Approve application error:', error);
        res.status(500).json({ error: 'Failed to approve application' });
    }
});

// Admin: Reject application
router.post('/:id/reject', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        await pool.query(
            `UPDATE account_applications SET
                status = 'rejete',
                rejection_reason = ?,
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [reason, req.params.id]
        );

        logger.info('Application rejected', { applicationId: req.params.id, reason });

        res.json({ message: 'Application rejected successfully' });
    } catch (error) {
        logger.error('Reject application error:', error);
        res.status(500).json({ error: 'Failed to reject application' });
    }
});

// Admin: Request correction
router.post('/:id/request-correction', authenticateToken, checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { correction_request } = req.body;

        if (!correction_request) {
            return res.status(400).json({ error: 'Correction request is required' });
        }

        await pool.query(
            `UPDATE account_applications SET
                status = 'correction_demandee',
                correction_request = ?,
                reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [correction_request, req.params.id]
        );

        logger.info('Correction requested', { applicationId: req.params.id, correction_request });

        res.json({ message: 'Correction requested successfully' });
    } catch (error) {
        logger.error('Request correction error:', error);
        res.status(500).json({ error: 'Failed to request correction' });
    }
});

// Admin: Get application by ID (must be last to avoid conflicts with specific routes)
router.get('/:id', authenticateToken, checkRole('admin', 'super_admin', 'agent'), async (req, res) => {
    try {
        const [applications] = await pool.query(
            `SELECT aa.*, u.first_name, u.last_name, u.email, u.phone 
            FROM account_applications aa 
            JOIN users u ON aa.user_id = u.id
            WHERE aa.id = ?`,
            [req.params.id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(applications[0]);
    } catch (error) {
        logger.error('Get application error:', error);
        res.status(500).json({ error: 'Failed to get application' });
    }
});

// Serve application documents with CORS
router.get('/document/:filename', authenticateToken, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads/account-applications', filename);
        
        if (fs.existsSync(filePath)) {
            // Read file and convert to base64 to avoid CORS issues
            const fileData = fs.readFileSync(filePath);
            const base64 = fileData.toString('base64');
            
            // Determine MIME type based on file extension
            const ext = path.extname(filename).toLowerCase();
            let mimeType = 'application/octet-stream';
            
            switch (ext) {
                case '.pdf':
                    mimeType = 'application/pdf';
                    break;
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                case '.doc':
                case '.docx':
                    mimeType = 'application/msword';
                    break;
            }
            
            res.json({
                data: `data:${mimeType};base64,${base64}`,
                filename: filename,
                mimeType: mimeType
            });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        logger.error('Serve document error:', error);
        res.status(500).json({ error: 'Failed to serve document' });
    }
});

module.exports = router;

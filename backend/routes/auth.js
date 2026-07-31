const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken, checkAccountLock } = require('../middleware/auth');
const { generateOTP, getOTPExpiry, verifyOTP } = require('../utils/otp');
const { logger, securityLogger } = require('../utils/logger');

const router = express.Router();

// Configuration de multer pour les photos de profil
const profilePhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/profile-photos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const profilePhotoUpload = multer({
    storage: profilePhotoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers JPEG, PNG et WebP sont autorisés'));
        }
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, role = 'client' } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const [existingEmail] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }

        const [existingPhone] = await pool.query(
            'SELECT id FROM users WHERE phone = ?',
            [phone]
        );

        if (existingPhone.length > 0) {
            return res.status(409).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpires = getOTPExpiry();

        // Insert user with first_name and last_name
        const [result] = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, phone, role, otp_code, otp_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name || null, last_name || null, email, passwordHash, phone, role, otpCode, otpExpires]
        );

        // Log registration
        securityLogger.info('User registration', {
            userId: result.insertId,
            email,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId,
            otp: process.env.NODE_ENV === 'development' ? otpCode : undefined // Only show OTP in development
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('[BACKEND] Login request received for email:', email);
    try {
        const { email, password } = req.body;

        console.log('[BACKEND] Processing login for:', email);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        console.log('[BACKEND] Users found:', users.length);

        if (users.length === 0) {
            console.log('[BACKEND] User not found for email:', email);
            securityLogger.warn('Login attempt with non-existent email', { email, ip: req.ip });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(403).json({ 
                error: 'Account locked',
                lockedUntil: user.locked_until
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            // Increment failed attempts
            const failedAttempts = user.failed_login_attempts + 1;
            const updateData = { failed_login_attempts: failedAttempts };

            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
                updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
            }

            await pool.query(
                'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
                [updateData.failed_login_attempts, updateData.locked_until || null, user.id]
            );

            securityLogger.warn('Failed login attempt', { 
                userId: user.id, 
                email, 
                ip: req.ip,
                failedAttempts 
            });

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset failed attempts on successful login
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
            [user.id]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        securityLogger.info('Successful login', { userId: user.id, email, ip: req.ip });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify OTP (without token - uses email)
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({ error: 'OTP and email are required' });
        }

        const [users] = await pool.query(
            'SELECT id, otp_code, otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        if (!verifyOTP(otp, user.otp_code, user.otp_expires)) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark user as verified and clear OTP
        await pool.query(
            'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE id = ?',
            [user.id]
        );

        // Generate JWT token after verification
        const token = jwt.sign(
            { userId: user.id, email: email, role: 'client' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({ 
            message: 'OTP verified successfully',
            token,
            user: {
                id: user.id,
                email: email,
                role: 'client',
                isVerified: true
            }
        });
    } catch (error) {
        logger.error('OTP verification error:', error);
        res.status(500).json({ error: 'OTP verification failed' });
    }
});

// Resend OTP
router.post('/resend-otp', authenticateToken, async (req, res) => {
    try {
        const otpCode = generateOTP();
        const otpExpires = getOTPExpiry();

        await pool.query(
            'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
            [otpCode, otpExpires, req.user.id]
        );

        // In production, send OTP via SMS/email here
        // For now, return OTP in development mode
        res.json({
            message: 'OTP sent successfully',
            otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
        });
    } catch (error) {
        logger.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching user profile for user ID:', req.user.id);
        const [users] = await pool.query(
            'SELECT id, first_name, last_name, email, phone, profile_photo, role, is_verified, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        console.log('Users found:', users.length);

        if (users.length === 0) {
            console.warn('User not found for ID:', req.user.id);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User profile fetched:', users[0].email);
        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        logger.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Upload profile photo
router.post('/profile-photo', authenticateToken, profilePhotoUpload.single('photo'), async (req, res) => {
    try {
        console.log('[PROFILE PHOTO] Upload request received');
        console.log('[PROFILE PHOTO] User:', req.user);
        console.log('[PROFILE PHOTO] File:', req.file);
        
        if (!req.file) {
            console.log('[PROFILE PHOTO] No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Delete old profile photo if exists
        console.log('[PROFILE PHOTO] Fetching old photo for user:', req.user.id);
        const [users] = await pool.query(
            'SELECT profile_photo FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length > 0 && users[0].profile_photo) {
            console.log('[PROFILE PHOTO] Old photo found:', users[0].profile_photo);
            const oldPhotoPath = path.join(__dirname, '..', users[0].profile_photo);
            if (fs.existsSync(oldPhotoPath)) {
                console.log('[PROFILE PHOTO] Deleting old photo');
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Store relative path from backend directory
        const relativePath = req.file.path.replace(/\\/g, '/');
        const uploadsIndex = relativePath.indexOf('/uploads/');
        const photoPath = uploadsIndex !== -1 ? relativePath.substring(uploadsIndex) : relativePath;
        
        console.log('[PROFILE PHOTO] New photo path:', photoPath);

        await pool.query(
            'UPDATE users SET profile_photo = ? WHERE id = ?',
            [photoPath, req.user.id]
        );

        console.log('[PROFILE PHOTO] Photo updated in database');
        res.json({
            message: 'Profile photo uploaded successfully',
            photoPath
        });
    } catch (error) {
        console.log('[PROFILE PHOTO] Error:', error);
        logger.error('Upload profile photo error:', error);
        res.status(500).json({ error: 'Failed to upload profile photo' });
    }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
    securityLogger.info('User logout', { userId: req.user.id, ip: req.ip });
    res.json({ message: 'Logged out successfully' });
});

// Serve profile photo with CORS
router.get('/profile-photo/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/profile-photos', filename);
    
    if (fs.existsSync(filePath)) {
        // Read file and convert to base64 to avoid CORS issues
        const fileData = fs.readFileSync(filePath);
        const base64 = fileData.toString('base64');
        const mimeType = 'image/jpeg'; // Default to JPEG, could be determined from extension
        
        res.json({
            data: `data:${mimeType};base64,${base64}`
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = router;

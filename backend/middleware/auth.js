const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        console.log('[AUTH] Authenticating token for:', req.method, req.originalUrl);
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('[AUTH] No token provided');
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[AUTH] Token decoded, userId:', decoded.userId);
        
        // Get user from database
        const [users] = await pool.query(
            'SELECT id, email, role, is_verified FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            console.log('[AUTH] User not found');
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = users[0];
        console.log('[AUTH] User authenticated:', req.user.email, 'role:', req.user.role);
        next();
    } catch (error) {
        console.log('[AUTH] Authentication error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Check user role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        console.log('[CHECKROLE] Checking role for:', req.user?.email, 'role:', req.user?.role, 'allowed:', allowedRoles);
        if (!req.user) {
            console.log('[CHECKROLE] No user in request');
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log('[CHECKROLE] Role check failed. User role:', req.user.role, 'not in allowed:', allowedRoles);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        console.log('[CHECKROLE] Role check passed');
        next();
    };
};

// Check if account is locked
const checkAccountLock = async (req, res, next) => {
    try {
        const [users] = await pool.query(
            'SELECT locked_until, failed_login_attempts FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(403).json({ 
                error: 'Account locked',
                lockedUntil: user.locked_until
            });
        }

        next();
    } catch (error) {
        console.error('Error checking account lock:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    authenticateToken,
    checkRole,
    checkAccountLock
};

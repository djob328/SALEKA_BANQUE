const crypto = require('crypto');
const db = require('../../config/database');
const twilio = require('twilio');

class OTPService {
    constructor() {
        // Only initialize Twilio if credentials are valid
        if (process.env.TWILIO_ACCOUNT_SID && 
            process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            this.twilioEnabled = true;
        } else {
            this.twilioClient = null;
            this.twilioEnabled = false;
            console.warn('Twilio credentials not configured. SMS will be logged to console in development mode.');
        }
    }

    /**
     * Generate OTP code
     * @param {number} userId - User ID
     * @param {string} type - OTP type (transfer, card_block, etc.)
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} OTP details
     */
    async generateOTP(userId, type, metadata = {}) {
        const connection = await db.getConnection();
        try {
            // Generate 6-digit OTP
            const otpCode = this.generateOTPCode();
            const reference = this.generateReference();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Get user phone
            const [users] = await connection.query(
                'SELECT phone FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                throw new Error('Utilisateur introuvable');
            }

            const user = users[0];

            // Save OTP
            await connection.query(
                `INSERT INTO otp_codes (user_id, code, type, reference, metadata, expires_at, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'active')`,
                [userId, otpCode, type, reference, JSON.stringify(metadata), expiresAt]
            );

            // Send OTP via SMS
            await this.sendSMS(user.phone, `Votre code OTP SALEKABANQUE est: ${otpCode}. Valide 10 minutes.`);

            return {
                success: true,
                reference,
                expiresAt
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Validate OTP code
     * @param {number} userId - User ID
     * @param {string} otpCode - OTP code
     * @param {string} reference - OTP reference
     * @returns {Promise<Object>} Validation result
     */
    async validateOTP(userId, otpCode, reference) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM otp_codes 
                 WHERE user_id = ? AND code = ? AND reference = ? AND status = 'active'`,
                [userId, otpCode, reference]
            );

            if (rows.length === 0) {
                return { valid: false, message: 'Code OTP invalide' };
            }

            const otp = rows[0];

            // Check expiration
            if (new Date(otp.expires_at) < new Date()) {
                await connection.query(
                    `UPDATE otp_codes SET status = 'expired' WHERE id = ?`,
                    [otp.id]
                );
                return { valid: false, message: 'Code OTP expiré' };
            }

            // Mark as used
            await connection.query(
                `UPDATE otp_codes SET status = 'used' WHERE id = ?`,
                [otp.id]
            );

            return {
                valid: true,
                metadata: JSON.parse(otp.metadata)
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Generate 6-digit OTP code
     * @returns {string} OTP code
     */
    generateOTPCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Generate unique reference
     * @returns {string} Reference
     */
    generateReference() {
        return 'OTP' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    /**
     * Send SMS via Twilio
     * @param {string} phone - Phone number
     * @param {string} message - SMS message
     * @returns {Promise<void>}
     */
    async sendSMS(phone, message) {
        try {
            await this.twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        } catch (error) {
            console.error('Error sending SMS:', error);
            // In development, log to console instead
            if (process.env.NODE_ENV === 'development') {
                console.log(`[SMS Mock] To: ${phone}, Message: ${message}`);
            }
        }
    }
}

module.exports = new OTPService();

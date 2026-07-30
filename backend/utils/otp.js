const crypto = require('crypto');

// Generate OTP
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
};

// Generate secure token
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Calculate OTP expiry (default 10 minutes)
const getOTPExpiry = (minutes = 10) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
};

// Verify OTP
const verifyOTP = (providedOTP, storedOTP, expiry) => {
    if (!providedOTP || !storedOTP) {
        return false;
    }

    if (new Date() > new Date(expiry)) {
        return false;
    }

    return providedOTP === storedOTP;
};

module.exports = {
    generateOTP,
    generateSecureToken,
    getOTPExpiry,
    verifyOTP
};

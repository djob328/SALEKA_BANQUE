const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default32characterencryptionkey!!';

// Encrypt data
const encrypt = (data) => {
    try {
        const jsonString = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
};

// Decrypt data
const decrypt = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        
        try {
            return JSON.parse(decryptedString);
        } catch {
            return decryptedString;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed');
    }
};

// Hash sensitive data (one-way)
const hashData = (data) => {
    return CryptoJS.SHA256(data).toString();
};

module.exports = {
    encrypt,
    decrypt,
    hashData
};

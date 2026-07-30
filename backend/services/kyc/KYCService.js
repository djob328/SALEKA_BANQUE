const db = require('../../config/database');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class KYCService {
    /**
     * Extract data from ID card using OCR
     * @param {string} imagePath - Path to ID card image
     * @returns {Promise<Object>} Extracted data
     */
    async extractIDCardData(imagePath) {
        try {
            // Preprocess image for better OCR
            const processedPath = await this.preprocessImage(imagePath);

            // Perform OCR
            const { data: { text } } = await Tesseract.recognize(
                processedPath,
                'fra',
                {
                    logger: m => console.log(m)
                }
            );

            // Extract information from text
            const extractedData = this.parseIDCardText(text);

            // Clean up processed image
            fs.unlinkSync(processedPath);

            return {
                success: true,
                data: extractedData,
                rawText: text
            };
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Erreur lors de l\'extraction des données de la CNI');
        }
    }

    /**
     * Verify selfie against ID card photo
     * @param {string} selfiePath - Path to selfie
     * @param {string} idPhotoPath - Path to ID card photo
     * @returns {Promise<Object>} Verification result
     */
    async verifySelfie(selfiePath, idPhotoPath) {
        try {
            // In production, this would use face-api.js or similar
            // For now, we'll simulate the verification
            
            // Compare face embeddings
            const similarity = await this.compareFaces(selfiePath, idPhotoPath);

            const isMatch = similarity > 0.7; // 70% threshold

            return {
                success: true,
                isMatch,
                similarity: Math.round(similarity * 100) / 100,
                message: isMatch ? 'Selfie vérifié avec succès' : 'Selfie ne correspond pas à la photo CNI'
            };
        } catch (error) {
            console.error('Selfie verification error:', error);
            throw new Error('Erreur lors de la vérification du selfie');
        }
    }

    /**
     * Detect document fraud
     * @param {string} imagePath - Path to document image
     * @returns {Promise<Object>} Fraud detection result
     */
    async detectDocumentFraud(imagePath) {
        try {
            const image = sharp(imagePath);
            const metadata = await image.metadata();

            const fraudIndicators = [];

            // Check for signs of manipulation
            // 1. Check image quality
            if (metadata.width < 300 || metadata.height < 200) {
                fraudIndicators.push('Résolution trop faible');
            }

            // 2. Check for unusual artifacts (simplified)
            const stats = await image.stats();
            if (stats.entropy < 3) {
                fraudIndicators.push('Image potentiellement altérée');
            }

            // 3. Check for expiration (would need date parsing)
            // This would be implemented with proper date extraction

            return {
                success: true,
                isSuspicious: fraudIndicators.length > 0,
                indicators: fraudIndicators,
                message: fraudIndicators.length > 0 
                    ? 'Document suspect détecté' 
                    : 'Document semble authentique'
            };
        } catch (error) {
            console.error('Fraud detection error:', error);
            throw new Error('Erreur lors de la détection de fraude');
        }
    }

    /**
     * Submit KYC application
     * @param {number} userId - User ID
     * @param {Object} kycData - KYC data
     * @returns {Promise<Object>} Submission result
     */
    async submitApplication(userId, kycData) {
        const connection = await db.getConnection();
        try {
            const {
                idCardNumber,
                idCardType,
                issueDate,
                expiryDate,
                idCardImage,
                selfieImage,
                signatureImage
            } = kycData;

            // Check if KYC already exists
            const [existing] = await connection.query(
                `SELECT id FROM kyc_applications WHERE user_id = ? AND status IN ('pending', 'approved')`,
                [userId]
            );

            if (existing.length > 0) {
                throw new Error('Un dossier KYC est déjà en cours ou approuvé');
            }

            // Create KYC application
            const result = await connection.query(
                `INSERT INTO kyc_applications 
                 (user_id, id_card_number, id_card_type, issue_date, expiry_date, 
                  id_card_image, selfie_image, signature_image, status, submitted_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [userId, idCardNumber, idCardType, issueDate, expiryDate,
                 idCardImage, selfieImage, signatureImage]
            );

            return {
                success: true,
                message: 'Dossier KYC soumis avec succès',
                applicationId: result[0].insertId,
                reference: `KYC${Date.now()}`
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get KYC application status
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Application status
     */
    async getApplicationStatus(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM kyc_applications WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1`,
                [userId]
            );

            if (rows.length === 0) {
                return {
                    success: true,
                    hasApplication: false,
                    message: 'Aucun dossier KYC soumis'
                };
            }

            const app = rows[0];

            return {
                success: true,
                hasApplication: true,
                application: {
                    id: app.id,
                    status: app.status,
                    submittedAt: app.submitted_at,
                    reviewedAt: app.reviewed_at,
                    rejectionReason: app.rejection_reason,
                    reference: `KYC${app.id}`
                }
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Preprocess image for OCR
     * @param {string} imagePath - Path to image
     * @returns {Promise<string>} Processed image path
     */
    async preprocessImage(imagePath) {
        const processedPath = imagePath.replace(/\.[^.]+$/, '_processed.png');

        await sharp(imagePath)
            .grayscale()
            .normalize()
            .sharpen()
            .toFile(processedPath);

        return processedPath;
    }

    /**
     * Parse ID card text to extract information
     * @param {string} text - OCR text
     * @returns {Object} Parsed data
     */
    parseIDCardText(text) {
        const data = {
            lastName: '',
            firstName: '',
            dateOfBirth: '',
            placeOfBirth: '',
            idNumber: '',
            sex: ''
        };

        // Simple pattern matching (would need to be enhanced for production)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        lines.forEach(line => {
            // Look for common patterns
            if (line.match(/nom|name/i)) {
                data.lastName = line.replace(/nom|name|:|\s+/gi, '').trim();
            }
            if (line.match(/prénom|first name/i)) {
                data.firstName = line.replace(/prénom|first name|:|\s+/gi, '').trim();
            }
            if (line.match(/né|born|naissance/i)) {
                data.dateOfBirth = line.match(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/)?.[0] || '';
            }
            if (line.match(/n°|numéro|number/i)) {
                data.idNumber = line.replace(/n°|numéro|number|:|\s+/gi, '').trim();
            }
        });

        return data;
    }

    /**
     * Compare faces (mock implementation)
     * @param {string} selfiePath - Selfie path
     * @param {string} idPhotoPath - ID photo path
     * @returns {Promise<number>} Similarity score
     */
    async compareFaces(selfiePath, idPhotoPath) {
        // In production, this would use face-api.js or similar
        // For now, return a mock similarity score
        await new Promise(resolve => setTimeout(resolve, 500));
        return 0.85; // Mock 85% similarity
    }
}

module.exports = new KYCService();

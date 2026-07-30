const db = require('../../config/database');
const crypto = require('crypto');

class CardService {
    /**
     * Order a new card
     * @param {number} userId - User ID
     * @param {Object} cardData - Card details
     * @returns {Promise<Object>} Order result
     */
    async orderCard(userId, cardData) {
        const connection = await db.getConnection();
        try {
            const { cardType, accountId } = cardData;

            // Get account
            const [accounts] = await connection.query(
                `SELECT * FROM accounts WHERE id = ? AND user_id = ? AND status = 'active'`,
                [accountId, userId]
            );

            if (accounts.length === 0) {
                throw new Error('Compte introuvable');
            }

            // Generate card number
            const cardNumber = this.generateCardNumber();
            const cvv = this.generateCVV();
            const expiryDate = this.generateExpiryDate();

            // Create card record
            await connection.query(
                `INSERT INTO cards (account_id, card_number, cvv, card_type, expiry_date, status, pin) 
                 VALUES (?, ?, ?, ?, ?, 'ordered', ?)`,
                [accountId, cardNumber, cvv, cardType, expiryDate, null]
            );

            return {
                success: true,
                message: 'Carte commandée avec succès. Vous recevrez une notification lors de son activation.',
                cardNumber: this.maskCardNumber(cardNumber)
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Block a card
     * @param {number} userId - User ID
     * @param {number} cardId - Card ID
     * @returns {Promise<Object>} Block result
     */
    async blockCard(userId, cardId) {
        const connection = await db.getConnection();
        try {
            // Verify card belongs to user
            const [cards] = await connection.query(
                `SELECT c.*, a.user_id FROM cards c 
                 JOIN accounts a ON c.account_id = a.id 
                 WHERE c.id = ? AND a.user_id = ?`,
                [cardId, userId]
            );

            if (cards.length === 0) {
                throw new Error('Carte introuvable');
            }

            await connection.query(
                `UPDATE cards SET status = 'blocked' WHERE id = ?`,
                [cardId]
            );

            return {
                success: true,
                message: 'Carte bloquée avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Unblock a card
     * @param {number} userId - User ID
     * @param {number} cardId - Card ID
     * @returns {Promise<Object>} Unblock result
     */
    async unblockCard(userId, cardId) {
        const connection = await db.getConnection();
        try {
            // Verify card belongs to user
            const [cards] = await connection.query(
                `SELECT c.*, a.user_id FROM cards c 
                 JOIN accounts a ON c.account_id = a.id 
                 WHERE c.id = ? AND a.user_id = ?`,
                [cardId, userId]
            );

            if (cards.length === 0) {
                throw new Error('Carte introuvable');
            }

            await connection.query(
                `UPDATE cards SET status = 'active' WHERE id = ?`,
                [cardId]
            );

            return {
                success: true,
                message: 'Carte débloquée avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Change card PIN
     * @param {number} userId - User ID
     * @param {number} cardId - Card ID
     * @param {string} oldPin - Old PIN
     * @param {string} newPin - New PIN
     * @returns {Promise<Object>} Change result
     */
    async changePin(userId, cardId, oldPin, newPin) {
        const connection = await db.getConnection();
        try {
            // Verify card belongs to user
            const [cards] = await connection.query(
                `SELECT c.*, a.user_id FROM cards c 
                 JOIN accounts a ON c.account_id = a.id 
                 WHERE c.id = ? AND a.user_id = ?`,
                [cardId, userId]
            );

            if (cards.length === 0) {
                throw new Error('Carte introuvable');
            }

            const card = cards[0];

            // Verify old PIN
            if (card.pin !== oldPin) {
                throw new Error('Ancien PIN incorrect');
            }

            // Update PIN
            await connection.query(
                `UPDATE cards SET pin = ? WHERE id = ?`,
                [newPin, cardId]
            );

            return {
                success: true,
                message: 'PIN modifié avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get card transactions
     * @param {number} userId - User ID
     * @param {number} cardId - Card ID
     * @returns {Promise<Object>} Card transactions
     */
    async getCardTransactions(userId, cardId) {
        const connection = await db.getConnection();
        try {
            // Verify card belongs to user
            const [cards] = await connection.query(
                `SELECT c.*, a.user_id FROM cards c 
                 JOIN accounts a ON c.account_id = a.id 
                 WHERE c.id = ? AND a.user_id = ?`,
                [cardId, userId]
            );

            if (cards.length === 0) {
                throw new Error('Carte introuvable');
            }

            const [transactions] = await connection.query(
                `SELECT * FROM card_transactions 
                 WHERE card_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT 20`,
                [cardId]
            );

            return {
                success: true,
                transactions: transactions.map(t => ({
                    id: t.id,
                    amount: parseFloat(t.amount),
                    merchant: t.merchant,
                    date: t.created_at,
                    status: t.status
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Generate card number (16 digits)
     * @returns {string} Card number
     */
    generateCardNumber() {
        // Generate a realistic-looking card number
        const prefix = '4'; // Visa
        const middle = crypto.randomBytes(6).toString('hex').toUpperCase().substring(0, 12);
        const checkDigit = this.calculateLuhnDigit(prefix + middle);
        return prefix + middle + checkDigit;
    }

    /**
     * Generate CVV (3 digits)
     * @returns {string} CVV
     */
    generateCVV() {
        return Math.floor(100 + Math.random() * 900).toString();
    }

    /**
     * Generate expiry date (3 years from now)
     * @returns {string} Expiry date (MM/YY)
     */
    generateExpiryDate() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${year}`;
    }

    /**
     * Calculate Luhn check digit
     * @param {string} number - Card number without check digit
     * @returns {string} Check digit
     */
    calculateLuhnDigit(number) {
        let sum = 0;
        let isEven = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    }

    /**
     * Mask card number for security
     * @param {string} cardNumber - Full card number
     * @returns {string} Masked card number
     */
    maskCardNumber(cardNumber) {
        if (!cardNumber) return '';
        return '**** **** **** ' + cardNumber.slice(-4);
    }
}

module.exports = new CardService();

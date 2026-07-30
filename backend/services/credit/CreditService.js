const db = require('../../config/database');

class CreditService {
    /**
     * Simulate credit calculation
     * @param {number} amount - Loan amount
     * @param {number} duration - Duration in months
     * @param {number} interestRate - Annual interest rate in %
     * @returns {Promise<Object>} Simulation result
     */
    async simulateCredit(amount, duration, interestRate) {
        // Calculate monthly interest rate
        const monthlyRate = (interestRate / 100) / 12;
        
        // Calculate monthly payment using amortization formula
        const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                              (Math.pow(1 + monthlyRate, duration) - 1);
        
        // Calculate total cost
        const totalCost = monthlyPayment * duration;
        const totalInterest = totalCost - amount;

        return {
            success: true,
            simulation: {
                amount: parseFloat(amount),
                duration: parseInt(duration),
                interestRate: parseFloat(interestRate),
                monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
                totalCost: parseFloat(totalCost.toFixed(2)),
                totalInterest: parseFloat(totalInterest.toFixed(2))
            }
        };
    }

    /**
     * Submit credit application
     * @param {number} userId - User ID
     * @param {Object} creditData - Credit application details
     * @returns {Promise<Object>} Application result
     */
    async submitApplication(userId, creditData) {
        const connection = await db.getConnection();
        try {
            const { amount, duration, interestRate, purpose, monthlyIncome, monthlyExpenses } = creditData;

            // Calculate monthly payment
            const simulation = await this.simulateCredit(amount, duration, interestRate);

            // Create credit application
            const result = await connection.query(
                `INSERT INTO credit_applications 
                 (user_id, amount, duration, interest_rate, monthly_payment, purpose, 
                  monthly_income, monthly_expenses, status, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [userId, amount, duration, interestRate, simulation.simulation.monthlyPayment, 
                 purpose, monthlyIncome, monthlyExpenses]
            );

            return {
                success: true,
                message: 'Demande de crédit soumise avec succès',
                applicationId: result[0].insertId,
                reference: `CRD${Date.now()}`
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get credit applications for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Applications list
     */
    async getApplications(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM credit_applications WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );

            return {
                success: true,
                applications: rows.map(app => ({
                    id: app.id,
                    amount: parseFloat(app.amount),
                    duration: app.duration,
                    interestRate: parseFloat(app.interest_rate),
                    monthlyPayment: parseFloat(app.monthly_payment),
                    purpose: app.purpose,
                    status: app.status,
                    createdAt: app.created_at,
                    reference: `CRD${app.id}`
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get application status
     * @param {number} userId - User ID
     * @param {number} applicationId - Application ID
     * @returns {Promise<Object>} Application status
     */
    async getApplicationStatus(userId, applicationId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM credit_applications WHERE id = ? AND user_id = ?`,
                [applicationId, userId]
            );

            if (rows.length === 0) {
                throw new Error('Demande introuvable');
            }

            const app = rows[0];

            return {
                success: true,
                application: {
                    id: app.id,
                    amount: parseFloat(app.amount),
                    duration: app.duration,
                    interestRate: parseFloat(app.interest_rate),
                    monthlyPayment: parseFloat(app.monthly_payment),
                    purpose: app.purpose,
                    status: app.status,
                    createdAt: app.created_at,
                    reference: `CRD${app.id}`,
                    reviewedAt: app.reviewed_at,
                    approvedAt: app.approved_at,
                    rejectionReason: app.rejection_reason
                }
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Upload supporting documents for credit application
     * @param {number} userId - User ID
     * @param {number} applicationId - Application ID
     * @param {Array} documents - Array of document paths
     * @returns {Promise<Object>} Upload result
     */
    async uploadDocuments(userId, applicationId, documents) {
        const connection = await db.getConnection();
        try {
            // Verify application belongs to user
            const [apps] = await connection.query(
                `SELECT id FROM credit_applications WHERE id = ? AND user_id = ?`,
                [applicationId, userId]
            );

            if (apps.length === 0) {
                throw new Error('Demande introuvable');
            }

            // Insert documents
            for (const doc of documents) {
                await connection.query(
                    `INSERT INTO credit_documents (application_id, document_type, file_path, uploaded_at) 
                     VALUES (?, ?, ?, NOW())`,
                    [applicationId, doc.type, doc.path]
                );
            }

            return {
                success: true,
                message: 'Documents uploadés avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get active credits for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Active credits
     */
    async getActiveCredits(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT * FROM credits WHERE user_id = ? AND status = 'active'`,
                [userId]
            );

            return {
                success: true,
                credits: rows.map(credit => ({
                    id: credit.id,
                    amount: parseFloat(credit.amount),
                    remainingAmount: parseFloat(credit.remaining_amount),
                    monthlyPayment: parseFloat(credit.monthly_payment),
                    nextPaymentDate: credit.next_payment_date,
                    endDate: credit.end_date
                }))
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = new CreditService();

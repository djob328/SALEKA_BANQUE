const db = require('../../config/database');

class AppointmentService {
    /**
     * Get available appointment slots
     * @param {number} agencyId - Agency ID
     * @param {string} date - Date (YYYY-MM-DD)
     * @returns {Promise<Object>} Available slots
     */
    async getAvailableSlots(agencyId, date) {
        const connection = await db.getConnection();
        try {
            // Get agency working hours
            const [agencies] = await connection.query(
                `SELECT opening_time, closing_time FROM agencies WHERE id = ?`,
                [agencyId]
            );

            if (agencies.length === 0) {
                throw new Error('Agence introuvable');
            }

            const agency = agencies[0];
            const slots = this.generateTimeSlots(agency.opening_time, agency.closing_time);

            // Get booked slots for the date
            const [booked] = await connection.query(
                `SELECT appointment_time FROM appointments 
                 WHERE agency_id = ? AND appointment_date = ? AND status != 'cancelled'`,
                [agencyId, date]
            );

            const bookedTimes = booked.map(b => b.appointment_time);

            // Filter available slots
            const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

            return {
                success: true,
                date,
                availableSlots
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Book an appointment
     * @param {number} userId - User ID
     * @param {Object} appointmentData - Appointment details
     * @returns {Promise<Object>} Booking result
     */
    async bookAppointment(userId, appointmentData) {
        const connection = await db.getConnection();
        try {
            const { agencyId, date, time, reason, type } = appointmentData;

            // Check if slot is available
            const [existing] = await connection.query(
                `SELECT id FROM appointments 
                 WHERE agency_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
                [agencyId, date, time]
            );

            if (existing.length > 0) {
                throw new Error('Ce créneau est déjà réservé');
            }

            // Create appointment
            const result = await connection.query(
                `INSERT INTO appointments 
                 (user_id, agency_id, appointment_date, appointment_time, reason, type, status, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, 'confirmed', NOW())`,
                [userId, agencyId, date, time, reason, type]
            );

            return {
                success: true,
                message: 'Rendez-vous confirmé avec succès',
                appointmentId: result[0].insertId,
                reference: `RDV${Date.now()}`
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Get user appointments
     * @param {number} userId - User ID
     * @returns {Promise<Object>} User appointments
     */
    async getUserAppointments(userId) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT a.*, ag.name as agency_name, ag.address as agency_address 
                 FROM appointments a
                 JOIN agencies ag ON a.agency_id = ag.id
                 WHERE a.user_id = ? 
                 ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
                [userId]
            );

            return {
                success: true,
                appointments: rows.map(app => ({
                    id: app.id,
                    date: app.appointment_date,
                    time: app.appointment_time,
                    reason: app.reason,
                    type: app.type,
                    status: app.status,
                    agencyName: app.agency_name,
                    agencyAddress: app.agency_address,
                    reference: `RDV${app.id}`
                }))
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Cancel appointment
     * @param {number} userId - User ID
     * @param {number} appointmentId - Appointment ID
     * @returns {Promise<Object>} Cancellation result
     */
    async cancelAppointment(userId, appointmentId) {
        const connection = await db.getConnection();
        try {
            // Verify appointment belongs to user
            const [appointments] = await connection.query(
                `SELECT * FROM appointments WHERE id = ? AND user_id = ?`,
                [appointmentId, userId]
            );

            if (appointments.length === 0) {
                throw new Error('Rendez-vous introuvable');
            }

            const appointment = appointments[0];

            // Check if can be cancelled (at least 24h before)
            const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
            const now = new Date();
            const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                throw new Error('Impossible d\'annuler moins de 24h avant le rendez-vous');
            }

            await connection.query(
                `UPDATE appointments SET status = 'cancelled' WHERE id = ?`,
                [appointmentId]
            );

            return {
                success: true,
                message: 'Rendez-vous annulé avec succès'
            };
        } finally {
            connection.release();
        }
    }

    /**
     * Reschedule appointment
     * @param {number} userId - User ID
     * @param {number} appointmentId - Appointment ID
     * @param {string} newDate - New date
     * @param {string} newTime - New time
     * @returns {Promise<Object>} Reschedule result
     */
    async rescheduleAppointment(userId, appointmentId, newDate, newTime) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Get appointment
            const [appointments] = await connection.query(
                `SELECT * FROM appointments WHERE id = ? AND user_id = ?`,
                [appointmentId, userId]
            );

            if (appointments.length === 0) {
                throw new Error('Rendez-vous introuvable');
            }

            const appointment = appointments[0];

            // Check if new slot is available
            const [existing] = await connection.query(
                `SELECT id FROM appointments 
                 WHERE agency_id = ? AND appointment_date = ? AND appointment_time = ? 
                 AND status != 'cancelled' AND id != ?`,
                [appointment.agency_id, newDate, newTime, appointmentId]
            );

            if (existing.length > 0) {
                throw new Error('Ce créneau est déjà réservé');
            }

            // Update appointment
            await connection.query(
                `UPDATE appointments SET appointment_date = ?, appointment_time = ? WHERE id = ?`,
                [newDate, newTime, appointmentId]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Rendez-vous reprogrammé avec succès'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Generate time slots based on working hours
     * @param {string} openingTime - Opening time (HH:MM)
     * @param {string} closingTime - Closing time (HH:MM)
     * @returns {Array<string>} Time slots
     */
    generateTimeSlots(openingTime, closingTime) {
        const slots = [];
        const [openHour, openMin] = openingTime.split(':').map(Number);
        const [closeHour, closeMin] = closingTime.split(':').map(Number);

        let currentHour = openHour;
        let currentMin = openMin;

        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            const time = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
            slots.push(time);

            // Add 30 minutes
            currentMin += 30;
            if (currentMin >= 60) {
                currentMin -= 60;
                currentHour++;
            }
        }

        return slots;
    }
}

module.exports = new AppointmentService();

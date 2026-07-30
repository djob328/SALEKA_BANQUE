const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool with promises
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banque_pwa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function resetAdminPassword() {
    try {
        console.log('🔑 Resetting admin password...');

        const passwordHash = await bcrypt.hash('admin123', 10);
        
        await pool.query(
            'UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL WHERE email = ?',
            [passwordHash, 'admin@banque.cm']
        );
        
        console.log('✅ Admin password reset successfully');
        console.log('📧 Email: admin@banque.cm');
        console.log('🔑 Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
}

resetAdminPassword();

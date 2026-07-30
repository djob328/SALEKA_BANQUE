const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateUserRole() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'banque_pwa',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('✅ Connected to database');

        const email = 'rostan@gmail.com';
        const newRole = 'client';

        // Check if user exists
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            await pool.end();
            return;
        }

        const user = users[0];
        console.log(`Current role: ${user.role}`);

        // Update user role
        await pool.query(
            'UPDATE users SET role = ? WHERE email = ?',
            [newRole, email]
        );

        console.log(`✅ User role updated successfully`);
        console.log(`Email: ${email}`);
        console.log(`New role: ${newRole}`);

        await pool.end();
        console.log('✅ Script completed');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

updateUserRole();

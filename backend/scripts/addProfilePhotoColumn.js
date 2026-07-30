const mysql = require('mysql2/promise');
require('dotenv').config();

async function addProfilePhotoColumn() {
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

        // Check if column exists
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_photo'
        `, [process.env.DB_NAME || 'banque_pwa']);

        if (columns.length > 0) {
            console.log('ℹ️  Column profile_photo already exists');
        } else {
            // Add the column
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN profile_photo VARCHAR(255) AFTER phone
            `);
            console.log('✅ Column profile_photo added successfully');
        }

        await pool.end();
        console.log('✅ Migration completed successfully');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addProfilePhotoColumn();

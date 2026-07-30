const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function removeSelfieColumn() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'banque_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('🔄 Début de la migration pour retirer la colonne selfie_path...');

        // Vérifier si la colonne existe
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'clients' 
            AND COLUMN_NAME = 'selfie_path'
        `, [process.env.DB_NAME || 'banque_db']);

        if (columns.length > 0) {
            // La colonne existe, on la retire
            await pool.query(`
                ALTER TABLE clients 
                DROP COLUMN selfie_path
            `);
            console.log('✅ Colonne selfie_path retirée avec succès');
        } else {
            console.log('ℹ️ La colonne selfie_path n\'existe pas, rien à faire');
        }

        console.log('✅ Migration terminée avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

removeSelfieColumn();

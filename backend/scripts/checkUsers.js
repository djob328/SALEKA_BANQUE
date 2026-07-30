const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
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

        const [users] = await pool.query('SELECT id, email, phone, role, is_verified, created_at FROM users');
        
        console.log('\n📋 Utilisateurs dans la base de données:');
        console.log('=====================================');
        
        if (users.length === 0) {
            console.log('Aucun utilisateur trouvé dans la base de données.');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user.id}`);
                console.log(`Email: ${user.email}`);
                console.log(`Téléphone: ${user.phone || 'N/A'}`);
                console.log(`Rôle: ${user.role}`);
                console.log(`Vérifié: ${user.is_verified ? 'Oui' : 'Non'}`);
                console.log(`Créé le: ${user.created_at}`);
                console.log('-------------------------------------');
            });
        }

        await pool.end();
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

checkUsers();

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

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        // Check if admin user already exists
        const [existingAdmin] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            ['admin@banque.cm']
        );

        if (existingAdmin.length === 0) {
            // Create admin user
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            await pool.query(
                `INSERT INTO users (email, password_hash, phone, role, is_verified) 
                 VALUES (?, ?, ?, ?, ?)`,
                ['admin@banque.cm', passwordHash, '+237600000000', 'admin', true]
            );
            
            console.log('✅ Admin user created: admin@banque.cm / admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Check if account types exist
        const [existingTypes] = await pool.query('SELECT id FROM account_types');
        
        if (existingTypes.length === 0) {
            // Insert account types
            await pool.query(`
                INSERT INTO account_types (name, description, min_balance, monthly_fee) VALUES
                ('Compte courant', 'Compte courant standard', 0, 500),
                ('Compte épargne', 'Compte épargne avec intérêts', 10000, 200),
                ('Compte étudiant', 'Compte pour étudiants', 0, 0),
                ('Compte entreprise', 'Compte professionnel', 50000, 1000),
                ('Mobile banking', 'Services bancaires mobiles', 0, 300),
                ('Carte bancaire', 'Carte de débit/crédit', 5000, 500)
            `);
            console.log('✅ Account types created');
        } else {
            console.log('ℹ️  Account types already exist');
        }

        // Check if agencies exist
        const [existingAgencies] = await pool.query('SELECT id FROM agencies');
        
        if (existingAgencies.length === 0) {
            // Insert sample agencies
            await pool.query(`
                INSERT INTO agencies (name, address, city, phone, email, latitude, longitude, opening_hours) VALUES
                ('Agence Centre', '123 Rue de la République', 'Yaoundé', '+237222233344', 'centre@banque.cm', 3.8488, 11.5021, '08:00-16:00'),
                ('Agence Akwa', '45 Boulevard de la Liberté', 'Douala', '+237233344555', 'akwa@banque.cm', 4.0493, 9.7043, '08:00-16:00'),
                ('Agence Bastos', '78 Rue des Princes', 'Yaoundé', '+237222211122', 'bastos@banque.cm', 3.8732, 11.5164, '08:00-16:00')
            `);
            console.log('✅ Sample agencies created');
        } else {
            console.log('ℹ️  Agencies already exist');
        }

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

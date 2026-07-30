const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    try {
        // Create connection without database specified
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'banque_pwa'}`);
        console.log(`✅ Database ${process.env.DB_NAME || 'banque_pwa'} created or already exists`);

        await connection.end();

        // Connect to the specific database
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

        // Create users table with first_name and last_name
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20) UNIQUE,
                profile_photo VARCHAR(255),
                role ENUM('client', 'admin', 'agent', 'super_admin') DEFAULT 'client',
                is_verified BOOLEAN DEFAULT FALSE,
                otp_code VARCHAR(10),
                otp_expires DATETIME,
                failed_login_attempts INT DEFAULT 0,
                locked_until DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created or already exists');

        // Create profiles table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                date_of_birth DATE,
                address TEXT,
                nationality VARCHAR(100),
                profession VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Profiles table created or already exists');

        // Create accounts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                account_number VARCHAR(20) UNIQUE NOT NULL,
                account_type ENUM('courant', 'epargne') DEFAULT 'courant',
                balance DECIMAL(15, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Accounts table created or already exists');

        // Create transactions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                user_id INT,
                transaction_type ENUM('depot', 'retrait', 'virement') NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                description TEXT,
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Transactions table created or already exists');

        // Create account_applications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS account_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                reference VARCHAR(50) UNIQUE NOT NULL,
                account_type ENUM('courant', 'epargne', 'jeune', 'entreprise', 'premium') NOT NULL,
                status ENUM('brouillon', 'soumis', 'en_cours_verification', 'approuve', 'rejete', 'correction_demandee') DEFAULT 'brouillon',
                
                -- Personal Information
                sex ENUM('M', 'F'),
                date_of_birth DATE,
                place_of_birth VARCHAR(100),
                nationality VARCHAR(100),
                
                -- Contact Information
                phone VARCHAR(20),
                email VARCHAR(255),
                address TEXT,
                country VARCHAR(100),
                region VARCHAR(100),
                city VARCHAR(100),
                neighborhood VARCHAR(100),
                
                -- Professional Information
                profession VARCHAR(100),
                employer VARCHAR(100),
                monthly_income DECIMAL(15, 2),
                income_source VARCHAR(100),
                
                -- Documents paths
                cni_recto_path VARCHAR(255),
                cni_verso_path VARCHAR(255),
                passport_path VARCHAR(255),
                photo_identite_path VARCHAR(255),
                justificatif_domicile_path VARCHAR(255),
                bulletin_salaire_path VARCHAR(255),
                registre_commerce_path VARCHAR(255),
                carte_contribuable_path VARCHAR(255),
                attestation_travail_path VARCHAR(255),
                
                -- Biometric
                selfie_path VARCHAR(255),
                
                -- Signature
                signature_path VARCHAR(255),
                
                -- Legal
                terms_accepted BOOLEAN DEFAULT FALSE,
                privacy_accepted BOOLEAN DEFAULT FALSE,
                
                -- Admin feedback
                rejection_reason TEXT,
                correction_request TEXT,
                admin_notes TEXT,
                
                -- Completion tracking
                completion_percentage INT DEFAULT 0,
                
                -- Timestamps
                submitted_at TIMESTAMP NULL,
                reviewed_at TIMESTAMP NULL,
                approved_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Account applications table created or already exists');

        // Create admin user if it doesn't exist
        const bcrypt = require('bcryptjs');
        const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@banque.cm']);
        
        if (existingAdmin.length === 0) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (email, password_hash, phone, role, is_verified) VALUES (?, ?, ?, ?, ?)',
                ['admin@banque.cm', passwordHash, '+237600000000', 'admin', true]
            );
            console.log('✅ Admin user created (admin@banque.cm / admin123)');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        await pool.end();
        console.log('✅ Database initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initDatabase();

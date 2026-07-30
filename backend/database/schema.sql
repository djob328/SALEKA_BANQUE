-- Database Schema for Banking Pre-enrollment PWA Platform

CREATE DATABASE IF NOT EXISTS banque_pwa;
USE banque_pwa;

-- Users table (for authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'agent', 'admin', 'super_admin') DEFAULT 'client',
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expires DATETIME,
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- Clients table (personal information)
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    sex ENUM('M', 'F') NOT NULL,
    nationality VARCHAR(100) DEFAULT 'Cameroun',
    address TEXT NOT NULL,
    city VARCHAR(100),
    profession VARCHAR(100),
    income DECIMAL(15, 2),
    cni_number VARCHAR(50) UNIQUE,
    passport_number VARCHAR(50),
    status ENUM('en_attente', 'verification_en_cours', 'valide', 'rejete', 'complement_demande') DEFAULT 'en_attente',
    qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_cni (cni_number)
);

-- Account types
CREATE TABLE account_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_balance DECIMAL(15, 2) DEFAULT 0,
    monthly_fee DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Client accounts
CREATE TABLE client_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    account_type_id INT NOT NULL,
    account_number VARCHAR(50) UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    status ENUM('pending', 'active', 'blocked', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (account_type_id) REFERENCES account_types(id),
    INDEX idx_client (client_id),
    INDEX idx_account_number (account_number)
);

-- Documents table (KYC)
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    document_type ENUM('cni_recto', 'cni_verso', 'passeport', 'justificatif_domicile', 'selfie', 'autre') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(100),
    ocr_data JSON,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_type (document_type),
    INDEX idx_status (verification_status)
);

-- Agencies table
CREATE TABLE agencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    opening_hours JSON,
    services JSON,
    max_daily_appointments INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude)
);

-- Appointments table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    agency_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    queue_number INT,
    status ENUM('confirmed', 'pending', 'completed', 'cancelled', 'no_show') DEFAULT 'confirmed',
    qr_code VARCHAR(255),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (agency_id) REFERENCES agencies(id),
    INDEX idx_client (client_id),
    INDEX idx_agency (agency_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);

-- Queue management
CREATE TABLE queue_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agency_id INT NOT NULL,
    client_id INT NOT NULL,
    queue_number INT NOT NULL,
    status ENUM('waiting', 'serving', 'completed', 'skipped') DEFAULT 'waiting',
    estimated_wait_time INT,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (agency_id) REFERENCES agencies(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    INDEX idx_agency (agency_id),
    INDEX idx_status (status),
    INDEX idx_queue (queue_number)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('dossier_accepte', 'document_rejete', 'rappel_rendez_vous', 'maintenance', 'otp', 'autre') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Security logs
CREATE TABLE security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    status ENUM('success', 'failure', 'suspicious') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Electronic signatures
CREATE TABLE signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    signature_data TEXT NOT NULL,
    ip_address VARCHAR(45),
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client (client_id)
);

-- Insert default account types
INSERT INTO account_types (name, description, min_balance, monthly_fee) VALUES
('Compte Courant', 'Compte bancaire standard pour transactions quotidiennes', 0, 500),
('Compte Épargne', 'Compte d\'épargne avec taux d\'intérêt', 10000, 0),
('Compte Étudiant', 'Compte spécial pour étudiants', 0, 0),
('Compte Entreprise', 'Compte pour professionnels et entreprises', 50000, 1000),
('Mobile Banking', 'Accès complet aux services mobiles', 0, 200),
('Carte Bancaire', 'Compte avec carte de débit incluse', 5000, 500);

-- Insert default admin user (password: admin123 - change in production)
INSERT INTO users (email, password_hash, role, is_verified) VALUES
('admin@banque.cm', '$2a$10$8K1p/a0dL1XJ5G5V5V5V5O5X5Y5Z5a5b5c5d5e5f5g5h5i5j5k5l5m5n5o', 'super_admin', TRUE);

-- Insert sample agencies
INSERT INTO agencies (name, address, latitude, longitude, phone, email, opening_hours, services) VALUES
('Agence Centre', 'Douala, Akwa, Boulevard de la Liberté', 4.0483, 9.7043, '+237 233 42 33 33', 'akwa@banque.cm', 
 '{"lundi": "8:00-16:00", "mardi": "8:00-16:00", "mercredi": "8:00-16:00", "jeudi": "8:00-16:00", "vendredi": "8:00-16:00"}',
 '["comptes", "cartes", "epargne", "entreprise"]'),
('Agence Bonapriso', 'Douala, Bonapriso, Rue des Fleurs', 4.0527, 9.7029, '+237 233 42 44 44', 'bonapriso@banque.cm',
 '{"lundi": "8:00-16:00", "mardi": "8:00-16:00", "mercredi": "8:00-16:00", "jeudi": "8:00-16:00", "vendredi": "8:00-16:00"}',
 '["comptes", "cartes", "epargne", "mobile"]'),
('Agence Yaoundé', 'Yaoundé, Centre, Avenue Charles de Gaulle', 3.8736, 11.5021, '+237 222 22 22 22', 'yaounde@banque.cm',
 '{"lundi": "8:00-16:00", "mardi": "8:00-16:00", "mercredi": "8:00-16:00", "jeudi": "8:00-16:00", "vendredi": "8:00-16:00"}',
 '["comptes", "cartes", "epargne", "entreprise", "mobile"]');
-- ============================================
-- NOUVELLES TABLES POUR SALEKABANQUE COMPLETE
-- ============================================
-- Ajoutez ces tables à votre schema.sql existant
-- ============================================

-- Mise à jour de la table users pour ajouter first_name et last_name
ALTER TABLE users ADD COLUMN first_name VARCHAR(100) AFTER email;
ALTER TABLE users ADD COLUMN last_name VARCHAR(100) AFTER first_name;

-- Mise à jour de la table client_accounts pour ajouter les champs manquants
ALTER TABLE client_accounts ADD COLUMN account_type ENUM('courant', 'epargne', 'etudiant', 'entreprise') DEFAULT 'courant';
ALTER TABLE client_accounts ADD COLUMN currency VARCHAR(3) DEFAULT 'XAF';
ALTER TABLE client_accounts ADD COLUMN available_balance DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE client_accounts ADD COLUMN iban VARCHAR(34);
ALTER TABLE client_accounts ADD COLUMN daily_transfer_limit DECIMAL(15, 2) DEFAULT 500000;
ALTER TABLE client_accounts ADD COLUMN monthly_transfer_limit DECIMAL(15, 2) DEFAULT 5000000;
ALTER TABLE client_accounts ADD COLUMN daily_withdrawal_limit DECIMAL(15, 2) DEFAULT 200000;

-- Transactions table (historique des transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    balance_after DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(50) UNIQUE,
    category ENUM('virement', 'retrait', 'depot', 'paiement', 'frais', 'mobile_money', 'autre') DEFAULT 'autre',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES client_accounts(id) ON DELETE CASCADE,
    INDEX idx_account (account_id),
    INDEX idx_date (created_at),
    INDEX idx_reference (reference)
);

-- Cards table (cartes bancaires)
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    card_number VARCHAR(16) NOT NULL,
    cvv VARCHAR(3) NOT NULL,
    card_type ENUM('visa', 'mastercard', 'electron') DEFAULT 'visa',
    expiry_date VARCHAR(5) NOT NULL,
    pin VARCHAR(4),
    status ENUM('ordered', 'active', 'blocked', 'expired', 'cancelled') DEFAULT 'ordered',
    daily_limit DECIMAL(15, 2) DEFAULT 200000,
    monthly_limit DECIMAL(15, 2) DEFAULT 1000000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES client_accounts(id) ON DELETE CASCADE,
    INDEX idx_account (account_id),
    INDEX idx_card_number (card_number)
);

-- Card transactions table
CREATE TABLE IF NOT EXISTS card_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    merchant VARCHAR(255),
    location VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    INDEX idx_card (card_id),
    INDEX idx_date (created_at)
);

-- Transfers table (virements)
CREATE TABLE IF NOT EXISTS transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT NOT NULL,
    to_account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference VARCHAR(50) UNIQUE,
    otp_required BOOLEAN DEFAULT TRUE,
    otp_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (from_account_id) REFERENCES client_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES client_accounts(id) ON DELETE CASCADE,
    INDEX idx_from (from_account_id),
    INDEX idx_to (to_account_id),
    INDEX idx_status (status),
    INDEX idx_reference (reference)
);

-- Beneficiaries table (bénéficiaires favoris)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank VARCHAR(100) DEFAULT 'SALEKABANQUE',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_account (account_number)
);

-- Scheduled transfers table (virements programmés)
CREATE TABLE IF NOT EXISTS scheduled_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    beneficiary_account VARCHAR(50) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'monthly',
    day_of_month INT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
);

-- Credit applications table (demandes de crédit)
CREATE TABLE IF NOT EXISTS credit_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    duration INT NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    purpose TEXT,
    monthly_income DECIMAL(15, 2),
    monthly_expenses DECIMAL(15, 2),
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'disbursed') DEFAULT 'pending',
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Credit documents table (documents pour crédit)
CREATE TABLE IF NOT EXISTS credit_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    document_type ENUM('bulletin_salaire', 'factures', 'justificatif_domicile', 'autre') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES credit_applications(id) ON DELETE CASCADE,
    INDEX idx_application (application_id)
);

-- Credits table (crédits actifs)
CREATE TABLE IF NOT EXISTS credits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    application_id INT,
    amount DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    duration INT NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    next_payment_date DATE,
    end_date DATE,
    status ENUM('active', 'completed', 'defaulted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES credit_applications(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Savings accounts table (comptes épargne)
CREATE TABLE IF NOT EXISTS savings_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('classique', 'projet', 'scolaire') DEFAULT 'classique',
    balance DECIMAL(15, 2) DEFAULT 0,
    goal_amount DECIMAL(15, 2),
    goal_name VARCHAR(255),
    target_date DATE,
    interest_rate DECIMAL(5, 2) DEFAULT 3.0,
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_account_number (account_number)
);

-- Savings transactions table
CREATE TABLE IF NOT EXISTS savings_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    savings_account_id INT NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id) ON DELETE CASCADE,
    INDEX idx_account (savings_account_id),
    INDEX idx_date (created_at)
);

-- Auto deposits table (dépôts automatiques)
CREATE TABLE IF NOT EXISTS auto_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    savings_account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    frequency ENUM('weekly', 'monthly') DEFAULT 'monthly',
    day_of_month INT,
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
    next_deposit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Mobile Money transactions table
CREATE TABLE IF NOT EXISTS mobile_money_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider ENUM('mtn_momo', 'orange_money') NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('topup', 'withdrawal', 'bill_payment') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    transaction_id VARCHAR(100),
    reference VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_provider (provider),
    INDEX idx_date (created_at)
);

-- OTP codes table (codes OTP)
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('transfer', 'card_block', 'pin_change', 'login', 'autre') NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    metadata JSON,
    expires_at DATETIME NOT NULL,
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_reference (reference),
    INDEX idx_expires (expires_at)
);

-- Chat sessions table (sessions du chatbot)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('active', 'ended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Chat messages table (messages du chatbot)
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    role ENUM('user', 'assistant', 'function') NOT NULL,
    content TEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
);

-- KYC applications table (dossiers KYC)
CREATE TABLE IF NOT EXISTS kyc_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    id_card_number VARCHAR(50) NOT NULL,
    id_card_type ENUM('cni', 'passeport') NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    id_card_image VARCHAR(255),
    selfie_image VARCHAR(255),
    signature_image VARCHAR(255),
    status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_id_card (id_card_number)
);

-- Mise à jour de la table appointments pour ajouter les champs manquants
ALTER TABLE appointments ADD COLUMN type ENUM('general', 'credit', 'account', 'card') DEFAULT 'general';
ALTER TABLE appointments ADD COLUMN user_id INT AFTER client_id;
ALTER TABLE appointments ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- FIN DES NOUVELLES TABLES
-- ============================================

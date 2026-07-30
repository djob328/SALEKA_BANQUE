const pool = require('../config/database');
const { logger } = require('../utils/logger');

async function migrate() {
    try {
        console.log('🔄 Début de la migration...');

        // Ajouter la colonne account_type si elle n'existe pas
        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS account_type ENUM('courant', 'epargne', 'professionnel') DEFAULT 'courant'
        `);
        console.log('✅ Colonne account_type ajoutée ou existe déjà');

        // Ajouter la colonne cni_image_path si elle n'existe pas
        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS cni_image_path VARCHAR(500) NULL
        `);
        console.log('✅ Colonne cni_image_path ajoutée ou existe déjà');

        // Ajouter les colonnes pour tous les documents KYC
        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS cni_recto_path VARCHAR(500) NULL
        `);
        console.log('✅ Colonne cni_recto_path ajoutée ou existe déjà');

        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS cni_verso_path VARCHAR(500) NULL
        `);
        console.log('✅ Colonne cni_verso_path ajoutée ou existe déjà');

        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS passeport_path VARCHAR(500) NULL
        `);
        console.log('✅ Colonne passeport_path ajoutée ou existe déjà');

        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS justificatif_domicile_path VARCHAR(500) NULL
        `);
        console.log('✅ Colonne justificatif_domicile_path ajoutée ou existe déjà');

        // Ajouter la colonne pour la signature électronique
        await pool.query(`
            ALTER TABLE clients 
            ADD COLUMN IF NOT EXISTS signature_path VARCHAR(500) NULL
        `);
        console.log('✅ Colonne signature_path ajoutée ou existe déjà');

        console.log('✅ Migration terminée avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        logger.error('Migration error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Exécuter la migration
migrate();

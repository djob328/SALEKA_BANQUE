const pool = require('../config/database');

pool.query('DESCRIBE transactions')
  .then(([rows]) => {
    console.log('Structure de la table transactions:');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });

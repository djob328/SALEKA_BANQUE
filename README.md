# Banque PWA - Plateforme de Pré-enrôlement Client

Une plateforme de pré-enrôlement client pour banque en mode PWA (Progressive Web App) qui réduit les files d'attente en agence et accélère l'ouverture de compte.

## 🚀 Fonctionnalités

### Côté Client
- ✅ Inscription et authentification avec OTP SMS
- ✅ Pré-enrôlement avec informations personnelles
- ✅ Upload de documents KYC (CNI, passeport, justificatif, selfie)
- ✅ OCR pour lecture automatique de CNI
- ✅ Sélection de types de comptes
- ✅ Réservation de rendez-vous en agence
- ✅ QR code de rendez-vous
- ✅ File d'attente intelligente
- ✅ Géolocalisation des agences
- ✅ Signature électronique
- ✅ Tableau de bord avec suivi de dossier
- ✅ Notifications push

### Côté Admin
- ✅ Dashboard avec statistiques
- ✅ Gestion des clients
- ✅ Vérification KYC
- ✅ Gestion des agences
- ✅ Logs de sécurité
- ✅ Blocage de comptes

### Sécurité
- ✅ Authentification JWT
- ✅ OTP SMS pour vérification
- ✅ Chiffrement AES
- ✅ Protection anti brute-force
- ✅ Audit logs
- ✅ Protection CSRF/XSS

## 🛠️ Technologies

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons
- React Signature Canvas
- QR Code React
- Leaflet (cartes)
- Workbox (PWA)

### Backend
- Node.js
- Express.js
- MySQL
- JWT
- bcryptjs
- Multer (upload)
- Tesseract.js (OCR)
- QRCode
- Winston (logging)

## 📋 Prérequis

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd banque
```

### 2. Installer les dépendances

```bash
# Installer les dépendances racine
npm install

# Installer les dépendances frontend
cd frontend
npm install

# Installer les dépendances backend
cd ../backend
npm install
```

### 3. Configurer la base de données

```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE banque_pwa;
exit;

# Importer le schéma
cd backend
mysql -u root -p banque_pwa < database/schema.sql
```

### 4. Configurer les variables d'environnement

```bash
cd backend
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banque_pwa

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

ENCRYPTION_KEY=your_32_character_encryption_key

FRONTEND_URL=http://localhost:5173
```

### 5. Démarrer l'application

```bash
# Depuis la racine du projet
npm run dev
```

Cela démarrera:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Ou séparément:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📱 Utilisation

### Compte Admin par défaut
- Email: admin@banque.cm
- Mot de passe: admin123

⚠️ **Important**: Changez ce mot de passe en production !

### Flux client typique

1. **Inscription**: Créer un compte avec email et téléphone
2. **Vérification OTP**: Recevoir et entrer le code OTP
3. **Pré-enrôlement**: Remplir les informations personnelles
4. **Documents KYC**: Uploader CNI, passeport, justificatif, selfie
5. **Type de compte**: Choisir le(s) type(s) de compte souhaité(s)
6. **Rendez-vous**: Réserver un créneau en agence
7. **Signature**: Signer électroniquement les documents
8. **File d'attente**: Rejoindre la file virtuelle le jour J

### Flux admin typique

1. **Dashboard**: Voir les statistiques globales
2. **Clients**: Gérer les clients inscrits
3. **KYC**: Vérifier les documents uploadés
4. **Agences**: Gérer les agences bancaires
5. **Sécurité**: Surveiller les logs de sécurité

## 🗄️ Structure de la base de données

### Tables principales
- `users` - Utilisateurs et authentification
- `clients` - Profils clients
- `documents` - Documents KYC
- `appointments` - Rendez-vous
- `agencies` - Agences bancaires
- `queue_entries` - File d'attente
- `notifications` - Notifications
- `security_logs` - Logs de sécurité
- `account_types` - Types de comptes
- `client_accounts` - Comptes clients

## 🔐 Sécurité

- Tous les mots de passe sont hashés avec bcrypt
- Les tokens JWT expirent après 7 jours
- Protection contre brute-force (5 tentatives = blocage 30 min)
- Chiffrement des données sensibles avec AES
- Logs de toutes les actions de sécurité
- Validation des entrées côté serveur

## 📱 PWA

L'application est une PWA qui peut être installée sur:
- Android (Chrome)
- iOS (Safari)
- Desktop (Chrome/Edge)

Fonctionnalités PWA:
- Installation hors ligne
- Notifications push
- Mise à jour automatique
- Cache des ressources

## 🧪 Tests

```bash
# Tests backend (à implémenter)
cd backend
npm test

# Tests frontend (à implémenter)
cd frontend
npm test
```

## 🚀 Déploiement

### Backend (Production)
```bash
cd backend
npm run build
npm start
```

Utilisez PM2 pour la production:
```bash
npm install -g pm2
pm2 start server.js --name banque-api
```

### Frontend (Production)
```bash
cd frontend
npm run build
```
Les fichiers build seront dans `frontend/dist`

## 📝 Modules futurs

- [ ] Ouverture de compte complète en ligne
- [ ] Carte virtuelle
- [ ] Crédit bancaire
- [ ] Scoring IA
- [ ] Mobile Money
- [ ] Transfert d'argent
- [ ] Chatbot vocal
- [ ] Reconnaissance faciale

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de suivre ces étapes:

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- Votre Nom - Initial work

## 🙏 Remerciements

- Inspiré par Ecobank, UBA Group, Orange Money, MTN Mobile Money
- Stack technique recommandée pour le Cameroun et l'Afrique

## 📞 Support

Pour toute question ou support, contactez: support@banque.cm

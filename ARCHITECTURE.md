# SALEKABANQUE - Architecture de la Plateforme Bancaire Digitale

## Vue d'ensemble

SALEKABANQUE est une plateforme bancaire digitale complète avec un Agent IA (SALEKABOT) qui permet aux clients d'effectuer presque toutes les opérations bancaires sans se déplacer en agence.

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Dashboard | Transfers | Cards | Credits | Chatbot | Savings │
└──────────────────────────┬──────────────────────────────────┘
                               │ HTTPS/REST API
┌──────────────────────────────▼───────────────────────────────┐
│                    Backend (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AI Agent Layer (SALEKABOT)                 │  │
│  │  - Intent Analysis                                     │  │
│  │  - Function Calling (Tools)                            │  │
│  │  - RAG (Qdrant Vector DB)                              │  │
│  │  - Conversation Memory                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Layer (Business Logic)           │  │
│  │  AccountService | TransferService | CardService       │  │
│  │  CreditService | SavingsService | KYCService         │  │
│  │  MobileMoneyService | OTPService | AppointmentService │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Routes Layer (API Endpoints)             │  │
│  │  /api/accounts | /api/transfers | /api/cards          │  │
│  │  /api/credits | /api/savings | /api/chatbot           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                    Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MySQL      │  │   Qdrant     │  │   File Storage│      │
│  │  (Business)  │  │  (Vector DB) │  │  (Documents)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Structure du Backend

```
backend/
├── config/
│   └── database.js          # Configuration MySQL
├── services/                # Couche Service (Business Logic)
│   ├── account/
│   │   └── AccountService.js
│   ├── transfer/
│   │   └── TransferService.js
│   ├── card/
│   │   └── CardService.js
│   ├── credit/
│   │   └── CreditService.js
│   ├── savings/
│   │   └── SavingsService.js
│   ├── mobileMoney/
│   │   └── MobileMoneyService.js
│   ├── kyc/
│   │   └── KYCService.js
│   ├── appointment/
│   │   └── AppointmentService.js
│   └── otp/
│       └── OTPService.js
├── ai/                      # Couche IA
│   ├── agent/
│   │   └── SalekabotAgent.js    # Orchestrateur IA principal
│   ├── tools/                  # Tools pour Function Calling
│   │   ├── getBalance.js
│   │   ├── getTransactions.js
│   │   ├── transferMoney.js
│   │   ├── bookAppointment.js
│   │   ├── blockCard.js
│   │   ├── simulateCredit.js
│   │   └── ...
│   ├── rag/                    # RAG Implementation
│   │   ├── VectorStore.js
│   │   ├── DocumentLoader.js
│   │   └── Retriever.js
│   ├── knowledge/              # Base de connaissances
│   │   ├── documents/
│   │   └── index.js
│   └── prompts/
│       └── systemPrompt.js
├── routes/                  # API Routes
│   ├── accounts.js
│   ├── transfers.js
│   ├── cards.js
│   ├── credits.js
│   ├── savings.js
│   ├── mobileMoney.js
│   ├── chatbot.js
│   └── ...
├── middleware/
│   ├── auth.js
│   ├── otp.js
│   └── upload.js
├── database/
│   ├── schema.sql
│   └── migrations/
├── uploads/
│   ├── documents/
│   ├── photos/
│   └── signatures/
└── server.js
```

## Structure du Frontend

```
frontend/src/
├── components/
│   ├── ChatBot/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── ChatInput.jsx
│   │   └── VoiceRecorder.jsx
│   ├── Dashboard/
│   │   ├── AccountOverview.jsx
│   │   ├── QuickActions.jsx
│   │   └── RecentTransactions.jsx
│   ├── Transfers/
│   │   ├── TransferForm.jsx
│   │   ├── BeneficiariesList.jsx
│   │   └── ScheduledTransfers.jsx
│   ├── Cards/
│   │   ├── CardList.jsx
│   │   ├── CardDetails.jsx
│   │   └── PinChange.jsx
│   ├── Credits/
│   │   ├── CreditSimulator.jsx
│   │   ├── CreditApplication.jsx
│   │   └── CreditStatus.jsx
│   └── Savings/
│       ├── SavingsAccounts.jsx
│       ├── SavingsGoals.jsx
│       └── DepositForm.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Accounts.jsx
│   ├── Transfers.jsx
│   ├── Cards.jsx
│   ├── Credits.jsx
│   ├── Savings.jsx
│   ├── MobileMoney.jsx
│   └── Chatbot.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── ChatContext.jsx
├── services/
│   ├── api.js
│   └── chatbotService.js
└── App.jsx
```

## Base de Données MySQL

### Tables principales

1. **users** - Utilisateurs/clients
2. **accounts** - Comptes bancaires
3. **transactions** - Transactions
4. **cards** - Cartes bancaires
5. **transfers** - Virements
6. **beneficiaries** - Bénéficiaires
7. **credits** - Crédits
8. **savings_accounts** - Comptes épargne
9. **savings_goals** - Objectifs épargne
10. **mobile_money_transactions** - Transactions Mobile Money
11. **chat_sessions** - Sessions chatbot
12. **chat_messages** - Messages chatbot
13. **kyc_applications** - Dossiers KYC
14. **appointments** - Rendez-vous
15. **otp_codes** - Codes OTP

## Agent IA SALEKABOT

### Architecture

```
User Message
     ↓
Intent Analysis (OpenAI GPT)
     ↓
Function Calling (Tools)
     ↓
Service Layer Execution
     ↓
Database Operations
     ↓
Response Generation
     ↓
User Response
```

### Tools (Function Calling)

Chaque opération bancaire est exposée comme un tool:

- **getBalance**: Consulter le solde
- **getTransactions**: Voir l'historique
- **transferMoney**: Effectuer un virement
- **bookAppointment**: Prendre rendez-vous
- **blockCard**: Bloquer une carte
- **simulateCredit**: Simuler un crédit
- **addBeneficiary**: Ajouter un bénéficiaire
- **checkApplicationStatus**: Vérifier statut dossier
- **generateStatement**: Générer un relevé PDF

### RAG (Retrieval Augmented Generation)

- **Vector DB**: Qdrant
- **Documents**: PDF, DOCX, TXT
- **Knowledge Base**: Conditions, tarifs, FAQ, procédures

### Conversation Memory

- **chat_sessions**: Stocke les sessions
- **chat_messages**: Stocke les messages
- **Context**: Maintenu sur 10-20 messages

## Sécurité

- **JWT**: Authentification
- **OTP**: Validation des transactions sensibles
- **Rate Limiting**: Protection contre les attaques
- **Helmet**: Security headers
- **Encryption**: Données sensibles chiffrées
- **Audit Logs**: Toutes les actions loggées

## Intégrations Externes

- **MTN MoMo**: API Mobile Money
- **Orange Money**: API Mobile Money
- **Twilio**: SMS OTP
- **OpenAI**: GPT-4 pour l'IA
- **Qdrant**: Vector DB pour RAG

## Modules Principaux

### 1. Onboarding Digital
- Création de compte
- Scan CNI avec OCR
- Selfie avec vérification
- Signature électronique
- Choix agence et type de compte
- Génération IBAN

### 2. Gestion des Comptes
- Consultation solde
- Relevés PDF
- Gestion cartes
- Voir crédits
- Plafonds

### 3. Virements
- Inter-comptes personnels
- Inter-clients SALEKABANQUE
- Vers autres banques
- Bénéficiaires favoris
- Virements programmés/récurents

### 4. Mobile Money
- Intégration MTN MoMo
- Intégration Orange Money
- Alimentation compte
- Retrait vers Mobile Money
- Paiement factures

### 5. Cartes Bancaires
- Commander carte
- Bloquer/Débloquer
- Changer PIN
- Transactions carte

### 6. Retrait Sans Carte
- Génération QR Code
- Validation OTP
- Retrait distributeur

### 7. Paiement Marchand
- Scan QR Code
- Validation montant
- Paiement

### 8. Gestion Chèques
- Demande chéquier
- Opposition chèque
- Vérification chèque

### 9. Crédits
- Simulation
- Dépôt dossier
- Upload justificatifs
- Suivi demande

### 10. Épargne
- Épargne classique
- Épargne projet
- Épargne scolaire
- Objectifs financiers
- Dépôts automatiques

## Prompt Système SALEKABOT

```
Tu es SALEKABOT, assistant officiel de SALEKABANQUE.

Règles:
- Réponds en français ou anglais
- Utilise uniquement les données bancaires disponibles
- Ne jamais inventer d'informations
- Demander une authentification pour les données sensibles
- Exiger un OTP pour toute transaction financière
- Rediriger vers un conseiller si nécessaire
- Sois professionnel, courtois et précis
```

## Flux Utilisateur Typique

1. **Pré-enrôlement**: Client crée compte, scan CNI, selfie
2. **Validation KYC**: Agent vérifie documents
3. **Ouverture compte**: Compte activé avec IBAN
4. **Activation**: Client active Mobile Banking
5. **Utilisation**: Client utilise services via web app ou SALEKABOT

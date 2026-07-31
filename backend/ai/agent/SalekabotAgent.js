const OpenAI = require('openai');
const AccountService = require('../../services/account/AccountService');
const TransferService = require('../../services/transfer/TransferService');
const CardService = require('../../services/card/CardService');
const CreditService = require('../../services/credit/CreditService');
const SavingsService = require('../../services/savings/SavingsService');
const AppointmentService = require('../../services/appointment/AppointmentService');
const KYCService = require('../../services/kyc/KYCService');
const db = require('../../config/database');

class SalekabotAgent {
    constructor() {
        // Initialize OpenAI only if API key is available
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        } else {
            this.openai = null;
            console.log('OpenAI API key not configured. Chatbot will run in limited mode.');
        }
        
        this.systemPrompt = `Tu es SALEKABOT, l'assistant officiel de SALEKABANQUE.

Règles strictes:
- Réponds en français ou anglais selon la préférence de l'utilisateur
- Utilise uniquement les données bancaires disponibles dans le système
- Ne jamais inventer d'informations ou de montants
- Demander une authentification pour consulter des données sensibles
- Exiger un OTP pour toute transaction financière
- Rediriger vers un conseiller humain si la demande dépasse tes capacités
- Sois professionnel, courtois et précis dans tes réponses
- Pour les questions sur les produits bancaires, utilise ta base de connaissances
- En cas de doute, demande des clarifications à l'utilisateur

Ton rôle est d'aider les clients avec:
- La consultation de leurs comptes (solde, transactions, cartes)
- Les opérations bancaires (virements, paiements)
- Les demandes de crédit et d'épargne
- La prise de rendez-vous
- Les questions sur les produits et services
- Le processus d'ouverture de compte et KYC`;
    }

    /**
     * Process user message and generate response
     * @param {string} message - User message
     * @param {string} sessionId - Chat session ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Agent response
     */
    async processMessage(message, sessionId, userId = null) {
        try {
            // Check if OpenAI is configured
            if (!this.openai) {
                // Return fallback response when OpenAI is not configured
                await this.saveMessage(sessionId, 'user', message);
                await this.saveMessage(sessionId, 'assistant', 'Le service de chatbot n\'est pas configuré. Veuillez contacter le support pour activer cette fonctionnalité.');
                return {
                    success: false,
                    message: 'Le service de chatbot n\'est pas configuré. Veuillez contacter le support pour activer cette fonctionnalité.',
                    requiresAction: false
                };
            }

            // Get conversation history
            const history = await this.getConversationHistory(sessionId, 5);

            // Build messages array
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...history,
                { role: 'user', content: message }
            ];

            // Call OpenAI with function calling
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages,
                functions: this.getFunctionDefinitions(),
                function_call: 'auto',
                temperature: 0.7
            });

            const assistantMessage = response.choices[0].message;

            // Save user message
            await this.saveMessage(sessionId, 'user', message);

            // Check if function call is needed
            if (assistantMessage.function_call) {
                const functionName = assistantMessage.function_call.name;
                const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

                // Execute function
                const functionResult = await this.executeFunction(functionName, functionArgs, userId);

                // Save assistant message with function call
                await this.saveMessage(sessionId, 'assistant', assistantMessage.content, {
                    function_call: assistantMessage.function_call
                });

                // Get final response
                const finalResponse = await this.openai.chat.completions.create({
                    model: 'gpt-4',
                    messages: [
                        ...messages,
                        assistantMessage,
                        {
                            role: 'function',
                            name: functionName,
                            content: JSON.stringify(functionResult)
                        }
                    ],
                    temperature: 0.7
                });

                const finalMessage = finalResponse.choices[0].message.content;

                // Save final response
                await this.saveMessage(sessionId, 'assistant', finalMessage);

                return {
                    success: true,
                    message: finalMessage,
                    requiresAction: functionResult.requiresOTP || false,
                    actionData: functionResult
                };
            }

            // Save assistant message
            await this.saveMessage(sessionId, 'assistant', assistantMessage.content);

            return {
                success: true,
                message: assistantMessage.content,
                requiresAction: false
            };
        } catch (error) {
            console.error('Agent error:', error);
            return {
                success: false,
                message: 'Désolé, une erreur est survenue. Veuillez réessayer.'
            };
        }
    }

    /**
     * Get function definitions for OpenAI
     * @returns {Array} Function definitions
     */
    getFunctionDefinitions() {
        return [
            {
                name: 'getBalance',
                description: 'Retourne le solde des comptes du client',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'getTransactions',
                description: 'Retourne l\'historique des transactions du client',
                parameters: {
                    type: 'object',
                    properties: {
                        limit: {
                            type: 'number',
                            description: 'Nombre de transactions à retourner (défaut: 10)'
                        }
                    },
                    required: []
                }
            },
            {
                name: 'transferMoney',
                description: 'Effectue un virement vers un autre compte',
                parameters: {
                    type: 'object',
                    properties: {
                        amount: {
                            type: 'number',
                            description: 'Montant du virement en FCFA'
                        },
                        beneficiaryAccountNumber: {
                            type: 'string',
                            description: 'Numéro de compte du bénéficiaire'
                        },
                        description: {
                            type: 'string',
                            description: 'Description du virement'
                        }
                    },
                    required: ['amount', 'beneficiaryAccountNumber']
                }
            },
            {
                name: 'bookAppointment',
                description: 'Prend un rendez-vous avec un conseiller',
                parameters: {
                    type: 'object',
                    properties: {
                        agencyId: {
                            type: 'number',
                            description: 'ID de l\'agence'
                        },
                        date: {
                            type: 'string',
                            description: 'Date du rendez-vous (YYYY-MM-DD)'
                        },
                        time: {
                            type: 'string',
                            description: 'Heure du rendez-vous (HH:MM)'
                        },
                        reason: {
                            type: 'string',
                            description: 'Motif du rendez-vous'
                        }
                    },
                    required: ['agencyId', 'date', 'time', 'reason']
                }
            },
            {
                name: 'blockCard',
                description: 'Bloque une carte bancaire',
                parameters: {
                    type: 'object',
                    properties: {
                        cardId: {
                            type: 'number',
                            description: 'ID de la carte à bloquer'
                        }
                    },
                    required: ['cardId']
                }
            },
            {
                name: 'simulateCredit',
                description: 'Simule un crédit',
                parameters: {
                    type: 'object',
                    properties: {
                        amount: {
                            type: 'number',
                            description: 'Montant du crédit en FCFA'
                        },
                        duration: {
                            type: 'number',
                            description: 'Durée en mois'
                        },
                        interestRate: {
                            type: 'number',
                            description: 'Taux d\'intérêt annuel en %'
                        }
                    },
                    required: ['amount', 'duration', 'interestRate']
                }
            },
            {
                name: 'getCards',
                description: 'Retourne la liste des cartes du client',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'getCreditApplications',
                description: 'Retourne les demandes de crédit du client',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'getSavingsAccounts',
                description: 'Retourne les comptes épargne du client',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        ];
    }

    /**
     * Execute a function call
     * @param {string} functionName - Function name
     * @param {Object} args - Function arguments
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Function result
     */
    async executeFunction(functionName, args, userId) {
        switch (functionName) {
            case 'getBalance':
                return await AccountService.getBalance(userId);
            
            case 'getTransactions':
                return await AccountService.getTransactions(userId, args.limit || 10);
            
            case 'transferMoney':
                return await TransferService.transferMoney(userId, args);
            
            case 'bookAppointment':
                return await AppointmentService.bookAppointment(userId, args);
            
            case 'blockCard':
                return await CardService.blockCard(userId, args.cardId);
            
            case 'simulateCredit':
                return await CreditService.simulateCredit(args.amount, args.duration, args.interestRate);
            
            case 'getCards':
                return await AccountService.getCards(userId);
            
            case 'getCreditApplications':
                return await CreditService.getApplications(userId);
            
            case 'getSavingsAccounts':
                return await SavingsService.getSavingsAccounts(userId);
            
            default:
                return { error: 'Function not found' };
        }
    }

    /**
     * Get conversation history
     * @param {string} sessionId - Session ID
     * @param {number} limit - Number of messages
     * @returns {Promise<Array>} Conversation history
     */
    async getConversationHistory(sessionId, limit = 10) {
        const connection = await db.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT role, content, metadata FROM chat_messages 
                 WHERE session_id = ? 
                 ORDER BY created_at ASC 
                 LIMIT ?`,
                [sessionId, limit]
            );

            return rows.map(row => {
                const message = { role: row.role, content: row.content };
                if (row.metadata) {
                    message.function_call = JSON.parse(row.metadata).function_call;
                }
                return message;
            });
        } finally {
            connection.release();
        }
    }

    /**
     * Save a message to the database
     * @param {string} sessionId - Session ID
     * @param {string} role - Message role
     * @param {string} content - Message content
     * @param {Object} metadata - Optional metadata
     */
    async saveMessage(sessionId, role, content, metadata = null) {
        const connection = await db.getConnection();
        try {
            await connection.query(
                `INSERT INTO chat_messages (session_id, role, content, metadata, created_at) 
                 VALUES (?, ?, ?, ?, NOW())`,
                [sessionId, role, content, metadata ? JSON.stringify(metadata) : null]
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Create or get chat session
     * @param {number} userId - User ID
     * @returns {Promise<string>} Session ID
     */
    async getOrCreateSession(userId) {
        const connection = await db.getConnection();
        try {
            // Check for active session
            const [sessions] = await connection.query(
                `SELECT id FROM chat_sessions 
                 WHERE user_id = ? AND status = 'active' 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [userId]
            );

            if (sessions.length > 0) {
                return sessions[0].id;
            }

            // Create new session
            const result = await connection.query(
                `INSERT INTO chat_sessions (user_id, status, created_at) 
                 VALUES (?, 'active', NOW())`,
                [userId]
            );

            return result[0].insertId;
        } finally {
            connection.release();
        }
    }

    /**
     * End chat session
     * @param {string} sessionId - Session ID
     */
    async endSession(sessionId) {
        const connection = await db.getConnection();
        try {
            await connection.query(
                `UPDATE chat_sessions SET status = 'ended', ended_at = NOW() WHERE id = ?`,
                [sessionId]
            );
        } finally {
            connection.release();
        }
    }
}

module.exports = new SalekabotAgent();

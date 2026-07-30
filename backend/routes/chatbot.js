const express = require('express');
const router = express.Router();
const SalekabotAgent = require('../ai/agent/SalekabotAgent');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to SALEKABOT
 * @access  Private
 */
router.post('/message', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message requis' });
        }

        // Get or create session
        let session = sessionId;
        if (!session) {
            session = await SalekabotAgent.getOrCreateSession(userId);
        }

        // Process message
        const response = await SalekabotAgent.processMessage(userId, message, session);

        res.json(response);
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: error.message || 'Erreur du chatbot' });
    }
});

/**
 * @route   POST /api/chatbot/session
 * @desc    Create new chat session
 * @access  Private
 */
router.post('/session', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = await SalekabotAgent.getOrCreateSession(userId);

        res.json({ success: true, sessionId });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la création de session' });
    }
});

/**
 * @route   GET /api/chatbot/session/:sessionId
 * @desc    Get chat session history
 * @access  Private
 */
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Verify session belongs to user
        const db = require('../config/database');
        const connection = await db.getConnection();
        try {
            const [sessions] = await connection.query(
                'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
                [sessionId, userId]
            );

            if (sessions.length === 0) {
                return res.status(404).json({ error: 'Session introuvable' });
            }

            // Get messages
            const [messages] = await connection.query(
                `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`,
                [sessionId]
            );

            res.json({
                success: true,
                messages: messages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    createdAt: m.created_at
                }))
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Session history error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la récupération de l\'historique' });
    }
});

/**
 * @route   POST /api/chatbot/session/:sessionId/end
 * @desc    End chat session
 * @access  Private
 */
router.post('/session/:sessionId/end', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Verify session belongs to user
        const db = require('../config/database');
        const connection = await db.getConnection();
        try {
            const [sessions] = await connection.query(
                'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
                [sessionId, userId]
            );

            if (sessions.length === 0) {
                return res.status(404).json({ error: 'Session introuvable' });
            }

            await SalekabotAgent.endSession(sessionId);

            res.json({ success: true, message: 'Session terminée' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Session end error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la fin de session' });
    }
});

/**
 * @route   GET /api/chatbot/sessions
 * @desc    Get all user sessions
 * @access  Private
 */
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const db = require('../config/database');
        const connection = await db.getConnection();
        try {
            const [sessions] = await connection.query(
                `SELECT s.*, COUNT(m.id) as message_count 
                 FROM chat_sessions s
                 LEFT JOIN chat_messages m ON s.id = m.session_id
                 WHERE s.user_id = ?
                 GROUP BY s.id
                 ORDER BY s.created_at DESC`,
                [userId]
            );

            res.json({
                success: true,
                sessions: sessions.map(s => ({
                    id: s.id,
                    status: s.status,
                    messageCount: s.message_count,
                    createdAt: s.created_at,
                    endedAt: s.ended_at
                }))
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Sessions list error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la récupération des sessions' });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { uploadDocuments, uploadSingle } = require('../middleware/upload');
const { logger } = require('../utils/logger');
const Tesseract = require('tesseract.js');

const router = express.Router();

// Upload documents
router.post('/upload', authenticateToken, uploadDocuments, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Get client ID
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Client profile not found' });
        }

        const clientId = clients[0].id;
        const uploadedFiles = [];

        // Process each uploaded file
        for (const [fieldName, file] of Object.entries(req.files || {})) {
            if (file && file.length > 0) {
                const documentType = fieldName;
                const fileData = file[0];

                // Insert document record - store only filename, not full path
                const [result] = await connection.query(
                    `INSERT INTO documents 
                    (client_id, document_type, file_path, file_name, file_size, mime_type)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [clientId, documentType, fileData.filename, fileData.originalname, fileData.size, fileData.mimetype]
                );

                uploadedFiles.push({
                    id: result.insertId,
                    type: documentType,
                    filename: fileData.originalname
                });

                // Perform OCR on CNI documents (only for images, not PDFs)
                if (documentType.includes('cni') && fileData.mimetype.startsWith('image/')) {
                    try {
                        const { data: { text } } = await Tesseract.recognize(fileData.path, 'fra');
                        await connection.query(
                            'UPDATE documents SET ocr_data = ? WHERE id = ?',
                            [JSON.stringify({ text }), result.insertId]
                        );
                    } catch (ocrError) {
                        logger.error('OCR error:', ocrError);
                        // Continue without OCR if it fails
                    }
                }
            }
        }

        await connection.commit();

        logger.info('Documents uploaded', { clientId, fileCount: uploadedFiles.length });

        res.status(201).json({
            message: 'Documents uploaded successfully',
            documents: uploadedFiles
        });
    } catch (error) {
        await connection.rollback();
        logger.error('Upload documents error:', error);
        res.status(500).json({ error: 'Failed to upload documents' });
    } finally {
        connection.release();
    }
});

// Get client documents
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [clients] = await pool.query(
            'SELECT id FROM clients WHERE user_id = ?',
            [req.user.id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ error: 'Client profile not found' });
        }

        const [documents] = await pool.query(
            'SELECT id, document_type, file_name, verification_status, rejection_reason, uploaded_at FROM documents WHERE client_id = ?',
            [clients[0].id]
        );

        res.json(documents);
    } catch (error) {
        logger.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to get documents' });
    }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [documents] = await pool.query(
            'SELECT * FROM documents WHERE id = ?',
            [req.params.id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Verify ownership
        const [clients] = await pool.query(
            'SELECT user_id FROM clients WHERE id = ?',
            [documents[0].client_id]
        );

        if (clients[0].user_id !== req.user.id && !['admin', 'super_admin', 'agent'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(documents[0]);
    } catch (error) {
        logger.error('Get document error:', error);
        res.status(500).json({ error: 'Failed to get document' });
    }
});

// Admin: Verify document
router.patch('/:id/verify', authenticateToken, async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.query(
            'UPDATE documents SET verification_status = ?, rejection_reason = ?, verified_at = NOW() WHERE id = ?',
            [status, rejection_reason || null, req.params.id]
        );

        logger.info('Document verified', { documentId: req.params.id, status, adminId: req.user.id });

        res.json({ message: 'Document verification updated successfully' });
    } catch (error) {
        logger.error('Verify document error:', error);
        res.status(500).json({ error: 'Failed to verify document' });
    }
});

// Serve document file
router.get('/file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const path = require('path');
        const fs = require('fs');

        // Search in subdirectories
        const uploadsDir = path.join(__dirname, '../uploads');
        const subdirs = ['documents', 'signatures', 'avatars'];
        let filePath = null;

        for (const subdir of subdirs) {
            const testPath = path.join(uploadsDir, subdir, filename);
            if (fs.existsSync(testPath)) {
                filePath = testPath;
                break;
            }
        }

        if (!filePath) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf'
        };

        res.contentType(contentTypes[ext] || 'application/octet-stream');
        res.sendFile(filePath);
    } catch (error) {
        logger.error('Serve file error:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
});

// Admin: Get all documents for verification
router.get('/admin/all', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT d.*, c.first_name, c.last_name, c.user_id
            FROM documents d
            JOIN clients c ON d.client_id = c.id
        `;
        const params = [];

        if (status) {
            query += ' WHERE d.verification_status = ?';
            params.push(status);
        }

        query += ' ORDER BY d.uploaded_at DESC';

        const [documents] = await pool.query(query, params);

        res.json(documents);
    } catch (error) {
        logger.error('Get all documents error:', error);
        res.status(500).json({ error: 'Failed to get documents' });
    }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [documents] = await pool.query(
            'SELECT client_id FROM documents WHERE id = ?',
            [req.params.id]
        );

        if (documents.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Verify ownership
        const [clients] = await pool.query(
            'SELECT user_id FROM clients WHERE id = ?',
            [documents[0].client_id]
        );

        if (clients[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await pool.query('DELETE FROM documents WHERE id = ?', [req.params.id]);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        logger.error('Delete document error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;

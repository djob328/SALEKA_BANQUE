const express = require('express');
const Tesseract = require('tesseract.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Configuration de multer pour le stockage des images
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers JPEG, PNG et WebP sont autorisés'));
        }
    }
});

// Route pour l'extraction OCR depuis une image
router.post('/extract', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucune image fournie' });
        }

        logger.info('OCR extraction started', { userId: req.user.id });

        // Convertir le buffer en base64 pour Tesseract
        const imageBuffer = req.file.buffer;

        // Effectuer l'OCR avec Tesseract
        const result = await Tesseract.recognize(
            imageBuffer,
            'fra',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        logger.info('OCR progress', { progress: m.progress * 100 });
                    }
                }
            }
        );

        const extractedText = result.data.text;
        
        // Extraire les informations du texte OCR
        const extractedData = extractCNIInfo(extractedText);

        logger.info('OCR extraction completed', { 
            userId: req.user.id, 
            extractedFields: Object.keys(extractedData).length 
        });

        res.json({
            success: true,
            text: extractedText,
            data: extractedData,
            confidence: result.data.confidence
        });

    } catch (error) {
        logger.error('OCR extraction error:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'extraction OCR',
            details: error.message 
        });
    }
});

// Fonction pour extraire les informations de la CNI depuis le texte OCR
function extractCNIInfo(text) {
    const data = {
        last_name: '',
        first_name: '',
        date_of_birth: '',
        sex: '',
        nationality: '',
        cni_number: '',
        place_of_birth: ''
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Patterns pour extraire les informations
    const patterns = {
        // Nom
        nom: /(?:nom|name)\s*[:=]?\s*([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)/i,
        // Prénom
        prenom: /(?:pr[eé]nom|first\s*name)\s*[:=]?\s*([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)/i,
        // Date de naissance (format JJ/MM/AAAA ou JJ-MM-AAAA)
        dateNaissance: /(?:date\s*de\s*naissance|born|birth\s*date)\s*[:=]?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i,
        // Sexe
        sexe: /(?:sexe|sex|genre)\s*[:=]?\s*([MF])/i,
        // Nationalité
        nationalite: /(?:nationalit[eé]|nationality)\s*[:=]?\s*([A-Z][a-z]+)/i,
        // Numéro CNI (format camerounais: 1234567890123)
        cni: /(?:cni|carte\s*d'identit[eé]|id\s*card)\s*[:=]?\s*(\d{13})/i,
        // Lieu de naissance
        lieuNaissance: /(?:lieu\s*de\s*naissance|place\s*of\s*birth)\s*[:=]?\s*([A-Z][a-z]+)/i
    };

    // Analyser chaque ligne
    lines.forEach(line => {
        // Nom
        const nomMatch = line.match(patterns.nom);
        if (nomMatch && !data.last_name) {
            data.last_name = nomMatch[1].toUpperCase();
        }

        // Prénom
        const prenomMatch = line.match(patterns.prenom);
        if (prenomMatch && !data.first_name) {
            data.first_name = capitalizeWords(prenomMatch[1]);
        }

        // Date de naissance
        const dateMatch = line.match(patterns.dateNaissance);
        if (dateMatch && !data.date_of_birth) {
            data.date_of_birth = formatDate(dateMatch[1]);
        }

        // Sexe
        const sexeMatch = line.match(patterns.sexe);
        if (sexeMatch && !data.sex) {
            data.sex = sexeMatch[1].toUpperCase();
        }

        // Nationalité
        const natMatch = line.match(patterns.nationalite);
        if (natMatch && !data.nationality) {
            data.nationality = capitalizeWords(natMatch[1]);
        }

        // Numéro CNI
        const cniMatch = line.match(patterns.cni);
        if (cniMatch && !data.cni_number) {
            data.cni_number = cniMatch[1];
        }

        // Lieu de naissance
        const lieuMatch = line.match(patterns.lieuNaissance);
        if (lieuMatch && !data.place_of_birth) {
            data.place_of_birth = capitalizeWords(lieuMatch[1]);
        }
    });

    // Si aucun pattern n'a matché, essayer une extraction heuristique
    if (!data.last_name || !data.first_name) {
        const heuristicData = heuristicExtraction(lines);
        Object.assign(data, heuristicData);
    }

    return data;
}

// Extraction heuristique si les patterns ne fonctionnent pas
function heuristicExtraction(lines) {
    const data = {
        last_name: '',
        first_name: '',
        date_of_birth: '',
        sex: '',
        nationality: '',
        cni_number: '',
        place_of_birth: ''
    };

    // Chercher des lignes qui ressemblent à des noms (mots en majuscules)
    lines.forEach((line, index) => {
        // Si la ligne est en majuscules et contient 2-3 mots, c'est probablement un nom
        if (/^[A-Z\s]+$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 3) {
            const words = line.split(' ').filter(w => w.length > 1);
            if (words.length >= 2 && !data.last_name) {
                data.last_name = words[0];
                data.first_name = words.slice(1).join(' ');
            }
        }

        // Chercher un numéro à 13 chiffres (CNI camerounais)
        const cniMatch = line.match(/\d{13}/);
        if (cniMatch && !data.cni_number) {
            data.cni_number = cniMatch[0];
        }

        // Chercher une date
        const dateMatch = line.match(/\d{2}[-/]\d{2}[-/]\d{4}/);
        if (dateMatch && !data.date_of_birth) {
            data.date_of_birth = formatDate(dateMatch[0]);
        }
    });

    return data;
}

// Fonction utilitaire pour mettre en majuscule la première lettre de chaque mot
function capitalizeWords(str) {
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Fonction utilitaire pour formater la date
function formatDate(dateStr) {
    // Convertir JJ/MM/AAAA ou JJ-MM-AAAA en AAAA-MM-JJ
    const parts = dateStr.replace('/', '-').split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

// Route pour la validation de la qualité de l'image
router.post('/validate-quality', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucune image fournie' });
        }

        const validation = validateImageQuality(req.file);

        logger.info('Image quality validation', { 
            userId: req.user.id, 
            isValid: validation.isValid,
            score: validation.score 
        });

        res.json(validation);

    } catch (error) {
        logger.error('Image validation error:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la validation de l\'image',
            details: error.message 
        });
    }
});

// Fonction pour valider la qualité de l'image
function validateImageQuality(file) {
    const validation = {
        isValid: true,
        score: 100,
        issues: [],
        warnings: []
    };

    // Vérifier la taille du fichier
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB < 0.1) {
        validation.isValid = false;
        validation.score -= 30;
        validation.issues.push('Image trop petite (qualité insuffisante)');
    } else if (fileSizeMB > 5) {
        validation.warnings.push('Image très volumineuse');
        validation.score -= 10;
    }

    // Vérifier le type MIME
    if (!file.mimetype.startsWith('image/')) {
        validation.isValid = false;
        validation.issues.push('Ce n\'est pas une image valide');
    }

    // Vérifier les dimensions (basique - nécessiterait une librairie comme sharp pour une vraie validation)
    // Pour l'instant, on fait une estimation basée sur la taille du fichier
    if (fileSizeMB < 0.05) {
        validation.warnings.push('Image可能 trop petite en résolution');
        validation.score -= 20;
    }

    return validation;
}

// Route pour la détection de faux documents (basique)
router.post('/detect-fraud', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucune image fournie' });
        }

        // Effectuer l'OCR
        const result = await Tesseract.recognize(req.file.buffer, 'fra');
        const text = result.data.text;

        // Analyse basique de fraude
        const fraudAnalysis = detectDocumentFraud(text);

        logger.info('Fraud detection analysis', { 
            userId: req.user.id, 
            riskLevel: fraudAnalysis.riskLevel 
        });

        res.json(fraudAnalysis);

    } catch (error) {
        logger.error('Fraud detection error:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la détection de fraude',
            details: error.message 
        });
    }
});

// Fonction basique de détection de fraude
function detectDocumentFraud(text) {
    const analysis = {
        riskLevel: 'low',
        confidence: 0.8,
        indicators: [],
        warnings: []
    };

    const lowerText = text.toLowerCase();

    // Indicateurs de fraude basiques
    const fraudIndicators = [
        'sample',
        'specimen',
        'template',
        'demo',
        'test',
        'fake',
        'faux',
        'copie',
        'duplicate'
    ];

    fraudIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) {
            analysis.riskLevel = 'high';
            analysis.indicators.push(`Mot suspect détecté: ${indicator}`);
            analysis.confidence -= 0.2;
        }
    });

    // Vérifier si le texte semble être une vraie CNI camerounaise
    const cameroonIndicators = [
        'république du cameroun',
        'republic of cameroon',
        'cameroun',
        'cameroon',
        'carte d\'identité',
        'identity card'
    ];

    const hasCameroonIndicators = cameroonIndicators.some(indicator => 
        lowerText.includes(indicator)
    );

    if (!hasCameroonIndicators) {
        analysis.warnings.push('Le document ne semble pas être une CNI camerounaise');
        analysis.confidence -= 0.1;
    }

    return analysis;
}

module.exports = router;

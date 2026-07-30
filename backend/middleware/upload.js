const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['documents', 'signatures', 'avatars'];
subdirs.forEach(dir => {
    const fullPath = path.join(uploadDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subfolder = 'documents';
        
        if (file.fieldname === 'signature') {
            subfolder = 'signatures';
        } else if (file.fieldname === 'avatar') {
            subfolder = 'avatars';
        }
        
        const dest = path.join(uploadDir, subfolder);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // CNI documents must be images only (no PDF)
    if (file.fieldname === 'cni_recto' || file.fieldname === 'cni_verso') {
        const allowedImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];

        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('CNI documents must be images (JPEG, PNG, or WebP). PDF is not allowed.'), false);
        }
    }
    // Proof of residence can be images or PDF
    else if (file.fieldname === 'justificatif_domicile') {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'), false);
        }
    }
    // Other documents (passeport, selfie) - images only
    else {
        const allowedImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];

        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
        }
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    }
});

// Multiple file upload for documents
const uploadDocuments = upload.fields([
    { name: 'cni_recto', maxCount: 1 },
    { name: 'cni_verso', maxCount: 1 },
    { name: 'passeport', maxCount: 1 },
    { name: 'justificatif_domicile', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
]);

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

module.exports = {
    upload,
    uploadDocuments,
    uploadSingle
};

const multer = require('multer');
const path = require('path');
const fs = require('fs');

//Storage Settings:
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
                const uploadDir = path.join(__dirname, '..', 'uploads');
                // Ensure upload directory exists
                try {
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                } catch (err) {
                    return cb(err);
                }
                cb(null, uploadDir);
    }, 
    filename: (req, file, cb)=> {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

//file filter for image types:
const fileFilter = (req, file, cb)=>{
    // Accept common image mime types
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('only images are allowed'), false);
    }
};

const upload = multer({storage, fileFilter});

module.exports = upload;
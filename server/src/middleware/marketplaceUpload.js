const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
const productUploadsDir = path.join(uploadsDir, 'products');
const paymentUploadsDir = path.join(uploadsDir, 'payments');

[uploadsDir, productUploadsDir, paymentUploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const createMulterUploader = (subfolder, prefix) => {
  const destDir = path.join(uploadsDir, subfolder);
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  });
};

const uploadProductImage = createMulterUploader('products', 'prod');
const uploadPaymentProof = createMulterUploader('payments', 'pay');

module.exports = {
  uploadProductImage,
  uploadPaymentProof
};


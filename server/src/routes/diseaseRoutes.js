const express = require('express');
const router = express.Router();
const diseaseController = require('../controllers/diseaseController');
const diseaseInfoController = require('../controllers/diseaseInfoController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Optional auth so demo users can upload leaf images without forcing login first
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.post('/detect', optionalAuth, upload.single('leafImage'), diseaseController.detectDisease);
router.get('/history', authMiddleware, diseaseController.getDiseaseHistory);
router.delete('/history/all', authMiddleware, diseaseController.clearDiseaseHistory);
router.delete('/history/:id', authMiddleware, diseaseController.deleteDiseaseHistoryById);
router.get('/history/:id', authMiddleware, diseaseController.getDiseaseHistoryById);
router.get('/info', diseaseInfoController.getAllDiseases);
router.get('/info/:className', diseaseInfoController.getDiseaseByName);

module.exports = router;

const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/auth');

// Optional auth for instant testing or logged in farmer
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.post('/recommend', optionalAuth, cropController.recommendCrop);
router.get('/history', authMiddleware, cropController.getCropHistory);
router.delete('/history/all', authMiddleware, cropController.clearCropHistory);
router.delete('/history/:id', authMiddleware, cropController.deleteCropHistoryById);

module.exports = router;

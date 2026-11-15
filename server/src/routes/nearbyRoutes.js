const express = require('express');
const router = express.Router();
const nearbyController = require('../controllers/nearbyController');
const authMiddleware = require('../middleware/auth');

// Optional auth for nearby service queries so anyone can see local resources
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, nearbyController.getNearbyServices);

module.exports = router;

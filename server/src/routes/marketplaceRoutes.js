const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { uploadProductImage, uploadPaymentProof } = require('../middleware/marketplaceUpload');

// Controllers
const marketplaceController = require('../controllers/marketplaceController');
const productController = require('../controllers/productController');
const farmerProfileController = require('../controllers/farmerProfileController');
const orderController = require('../controllers/orderController');
const paymentAndFulfilmentController = require('../controllers/paymentAndFulfilmentController');
const analyticsAndExpenseController = require('../controllers/analyticsAndExpenseController');
const notificationController = require('../controllers/notificationController');

// ==========================================
// 1. PUBLIC MARKETPLACE ROUTES
// ==========================================
router.get('/products', marketplaceController.getMarketplaceProducts);
router.get('/products/:id', marketplaceController.getProductById);
router.get('/farmers', marketplaceController.getAllFarmers);
router.get('/farmers/:farmerId', farmerProfileController.getPublicFarmerProfile);

// ==========================================
// 2. FARMER PROFILE MANAGEMENT
// ==========================================
router.get(
  '/farmer/profile',
  authMiddleware,
  requireRole('farmer'),
  farmerProfileController.getMyProfile
);
router.put(
  '/farmer/profile',
  authMiddleware,
  requireRole('farmer'),
  uploadProductImage.single('profileImage'),
  farmerProfileController.updateMyProfile
);

// ==========================================
// 3. FARMER PRODUCT CRUD
// ==========================================
router.get(
  '/farmer/products',
  authMiddleware,
  requireRole('farmer'),
  productController.getMyProducts
);
router.post(
  '/farmer/products',
  authMiddleware,
  requireRole('farmer'),
  uploadProductImage.array('images', 5),
  productController.createProduct
);
router.put(
  '/farmer/products/:id',
  authMiddleware,
  requireRole('farmer'),
  uploadProductImage.array('images', 5),
  productController.updateProduct
);
router.delete(
  '/farmer/products/:id',
  authMiddleware,
  requireRole('farmer'),
  productController.deleteProduct
);
router.patch(
  '/farmer/products/:id/toggle',
  authMiddleware,
  requireRole('farmer'),
  productController.toggleProductStatus
);

// ==========================================
// 4. CONSUMER CHECKOUT & ORDERS
// ==========================================
router.post(
  '/checkout',
  authMiddleware,
  orderController.createCheckout
);
router.get(
  '/consumer/orders',
  authMiddleware,
  orderController.getConsumerOrders
);
router.get(
  '/consumer/orders/:orderId',
  authMiddleware,
  orderController.getConsumerOrderDetail
);
router.post(
  '/consumer/suborders/:suborderId/cancel',
  authMiddleware,
  orderController.cancelConsumerSuborder
);

// ==========================================
// 5. SIMULATED PAYMENT PROOF (CONSUMER UPLOAD & FARMER REVIEW)
// ==========================================
router.post(
  '/payment/upload-proof',
  authMiddleware,
  uploadPaymentProof.single('paymentScreenshot'),
  paymentAndFulfilmentController.submitPaymentProof
);
router.post(
  '/farmer/payment/review/:proofId',
  authMiddleware,
  requireRole('farmer'),
  paymentAndFulfilmentController.reviewPaymentProof
);

// ==========================================
// 6. FARMER ORDER FULFILMENT
// ==========================================
router.get(
  '/farmer/suborders',
  authMiddleware,
  requireRole('farmer'),
  paymentAndFulfilmentController.getFarmerSuborders
);
router.patch(
  '/farmer/suborders/:suborderId/status',
  authMiddleware,
  requireRole('farmer'),
  paymentAndFulfilmentController.updateSuborderFulfilment
);

// ==========================================
// 7. CULTIVATION EXPENSES & P&L ANALYTICS (FARMER)
// ==========================================
router.get(
  '/farmer/expenses',
  authMiddleware,
  requireRole('farmer'),
  analyticsAndExpenseController.getExpenses
);
router.post(
  '/farmer/expenses',
  authMiddleware,
  requireRole('farmer'),
  uploadProductImage.single('receipt'),
  analyticsAndExpenseController.createExpense
);
router.delete(
  '/farmer/expenses/:id',
  authMiddleware,
  requireRole('farmer'),
  analyticsAndExpenseController.deleteExpense
);
router.get(
  '/farmer/analytics',
  authMiddleware,
  requireRole('farmer'),
  analyticsAndExpenseController.getFarmerDashboardAnalytics
);

// ==========================================
// 8. NOTIFICATIONS
// ==========================================
router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markAsRead);
router.patch('/notifications/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;


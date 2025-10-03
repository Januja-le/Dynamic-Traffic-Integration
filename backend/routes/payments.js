const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', protect, paymentController.createOrder);

// Verify payment
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router;

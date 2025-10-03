const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { authorize } = require('../middleware/rbac');

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['student', 'alumni', 'admin'])
], authController.register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login);

// Get current user
router.get('/me', protect, authController.getMe);

// Admin: list users (basic analytics hook)
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const [total, students, alumni, admins, pending] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ verificationStatus: 'pending' })
    ]);
    return res.json({ success: true, data: { total, students, alumni, admins, pending } });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

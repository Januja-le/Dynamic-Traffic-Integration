const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const User = require('../models/User');
const { searchAlumni } = require('../controllers/userController');

// Get all users - admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Search alumni - students authenticated
router.get('/search/alumni', protect, authorize('student', 'admin'), searchAlumni);

// Update current user profile - student & alumni
router.put('/me', protect, authorize('student', 'alumni'), async (req, res) => {
  try {
    const updatableFields = [
      'name','phone','profilePicture','batch','department','linkedin','bio','skills','currentYear','interests','company','position','domain','yearsOfExperience','hourlyRate'
    ];
    const updates = {};
    updatableFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') updates[field] = req.body[field];
    });

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify a user - admin only
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    if (!['approved','rejected','pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, isVerified: status === 'approved' },
      { new: true }
    ).select('-password');

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

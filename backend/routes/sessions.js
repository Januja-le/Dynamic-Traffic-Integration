const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const sessionController = require('../controllers/sessionController');

// Create session
router.post('/', protect, authorize('student'), sessionController.createSession);

// Get all sessions
router.get('/', protect, sessionController.getSessions);

// Get session by ID
router.get('/:id', protect, sessionController.getSessionById);

// Update session
router.put('/:id', protect, sessionController.updateSession);

// Cancel session
router.put('/:id/cancel', protect, sessionController.cancelSession);

// Add feedback
router.post('/:id/feedback', protect, authorize('student'), sessionController.addFeedback);

module.exports = router;

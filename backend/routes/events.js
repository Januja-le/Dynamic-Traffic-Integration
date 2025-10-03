const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const Event = require('../models/Event');

// Create event - alumni or admin
router.post('/', protect, authorize('alumni', 'admin'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    return res.status(201).json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// List events - public to authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const { status, eventType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    const events = await Event.find(query).sort({ startDate: 1 });
    return res.json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update event - organizer or admin
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(event, req.body);
    await event.save();
    return res.json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

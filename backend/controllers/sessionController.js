const Session = require('../models/Session');
const User = require('../models/User');
const { createZoomMeeting } = require('../config/zoom');

// Create session
const createSession = async (req, res) => {
  try {
    const { alumni, title, description, scheduledDate, duration } = req.body;

    // Verify alumni exists and is verified
    const alumniUser = await User.findById(alumni);
    if (!alumniUser || alumniUser.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    if (!alumniUser.isVerified) {
      return res.status(400).json({ message: 'Alumni is not verified' });
    }

    const amount = alumniUser.hourlyRate * (duration / 60);

    const session = await Session.create({
      student: req.user._id,
      alumni,
      title,
      description,
      scheduledDate,
      duration,
      amount
    });

    await session.populate(['student', 'alumni'], 'name email profilePicture');

    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sessions
const getSessions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'alumni') {
      query.alumni = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('student', 'name email profilePicture')
      .populate('alumni', 'name email profilePicture company position')
      .sort({ scheduledDate: -1 });

    return res.json({ success: true, data: sessions });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get session by ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('student', 'name email profilePicture phone')
      .populate('alumni', 'name email profilePicture company position phone');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        session.student._id.toString() !== req.user._id.toString() && 
        session.alumni._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update session
const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && 
        session.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;

    // If confirming, create Zoom meeting
    if (status === 'confirmed' && !session.zoomMeetingId) {
      try {
        const zoomMeeting = await createZoomMeeting(
          session.title,
          session.scheduledDate,
          session.duration
        );

        session.zoomMeetingId = zoomMeeting.id;
        session.meetingLink = zoomMeeting.join_url;
        session.zoomPassword = zoomMeeting.password;
      } catch (error) {
        console.error('Zoom meeting creation failed:', error);
      }
    }

    session.status = status || session.status;
    await session.save();

    return res.json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Cancel session
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'cancelled';
    await session.save();

    return res.json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add feedback
const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.feedback = { rating, comment, date: new Date() };
    await session.save();

    return res.json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  cancelSession,
  addFeedback
};

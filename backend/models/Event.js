const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['webinar', 'workshop', 'networking', 'seminar', 'other'],
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: String,
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: String,
  capacity: {
    type: Number,
    default: 100
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  banner: String,
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

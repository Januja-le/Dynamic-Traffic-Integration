const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    required: function() { return this.role !== 'admin'; }
  },
  department: {
    type: String,
    required: function() { return this.role !== 'admin'; }
  },
  // Alumni specific fields
  company: {
    type: String,
    required: function() { return this.role === 'alumni'; }
  },
  position: {
    type: String,
    required: function() { return this.role === 'alumni'; }
  },
  domain: {
    type: String,
    required: function() { return this.role === 'alumni'; }
  },
  yearsOfExperience: {
    type: Number,
    required: function() { return this.role === 'alumni'; }
  },
  linkedin: String,
  bio: String,
  skills: [String],
  hourlyRate: {
    type: Number,
    default: 0
  },
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [String],
  // Student specific
  currentYear: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  interests: [String],
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

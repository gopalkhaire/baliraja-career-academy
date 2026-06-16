// models/User.js — Pending registration requests (not yet approved)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const schema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String },
  photo:    { type: String, default: '' },

  requestedRole: { type: String, enum: ['student', 'alumni'], required: true },
  status:        { type: String, enum: ['pending', 'rejected'], default: 'pending' },
  rejectedReason: String,

  // Student fields
  class: String, stream: String, village: String, district: String,
  // Alumni fields
  batch: String, college: String, branch: String, currentStatus: String, bio: String,

  // Password reset
  resetPasswordToken: String, resetPasswordExpires: Date,

  createdAt: { type: Date, default: Date.now }
});

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

schema.methods.generateResetToken = function () {
  const raw = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken   = crypto.createHash('sha256').update(raw).digest('hex');
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  return raw;
};

export default mongoose.model('User', schema);

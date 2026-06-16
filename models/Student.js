// models/Student.js — Official approved students
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const schema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  class:    { type: String, required: true, enum: ['11th', '12th'] },
  stream:   { type: String, required: true, enum: ['Science', 'Commerce', 'Arts'] },
  village:  String, district: String,
  photo:    { type: String, default: '' },
  phone:    String,
  email:    { type: String, unique: true, sparse: true, lowercase: true },
  password: String,
  resetPasswordToken: String, resetPasswordExpires: Date,
  approvedAt: { type: Date, default: Date.now },
  createdAt:  { type: Date, default: Date.now }
});

schema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  if (this.password.startsWith('$2')) return next(); // already hashed
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

export default mongoose.model('Student', schema);

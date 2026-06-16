// controllers/userAuthController.js
import crypto  from 'crypto';
import User    from '../models/User.js';
import Student from '../models/Student.js';
import Alumni  from '../models/Alumni.js';
import { sendPasswordReset } from '../config/mailer.js';

// ── Helper: look up the approved record from the right collection ─────────────
async function getApprovedRecord(session) {
  const { userId, userModel } = session;
  if (userModel === 'Student') return { record: await Student.findById(userId), role: 'student' };
  if (userModel === 'Alumni')  return { record: await Alumni.findById(userId),  role: 'alumni'  };
  return { record: null, role: null };
}

// ── GET /login ────────────────────────────────────────────────────────────────
export const getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/profile');
  res.render('user/login', { title: 'Login', messages: req.flash() });
};

// ── POST /login ───────────────────────────────────────────────────────────────
export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Email and password are required.');
      return res.redirect('/login');
    }
    const lEmail = email.toLowerCase();

    // Check Student collection (approved)
    const student = await Student.findOne({ email: lEmail });
    if (student?.password && await student.comparePassword(password)) {
      req.session.userId    = student._id.toString();
      req.session.userRole  = 'student';
      req.session.userModel = 'Student';
      req.session.userName  = student.name;
      req.flash('success', `Welcome back, ${student.name}!`);
      return res.redirect('/profile');
    }

    // Check Alumni collection (approved)
    const alumni = await Alumni.findOne({ email: lEmail });
    if (alumni?.password && await alumni.comparePassword(password)) {
      req.session.userId    = alumni._id.toString();
      req.session.userRole  = 'alumni';
      req.session.userModel = 'Alumni';
      req.session.userName  = alumni.name;
      req.flash('success', `Welcome back, ${alumni.name}!`);
      return res.redirect('/profile');
    }

    // Check pending/rejected requests
    const pending = await User.findOne({ email: lEmail });
    if (pending?.status === 'pending') {
      req.flash('error', 'Your account is pending admin approval. You will receive an email once approved.');
      return res.redirect('/login');
    }
    if (pending?.status === 'rejected') {
      req.flash('error', `Your registration was not approved. ${pending.rejectedReason ? 'Reason: ' + pending.rejectedReason : 'Contact the academy.'}`);
      return res.redirect('/login');
    }

    req.flash('error', 'Invalid email or password.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/login');
  }
};

// ── GET /register ─────────────────────────────────────────────────────────────
export const getRegister = (req, res) => {
  if (req.session.userId) return res.redirect('/profile');
  res.render('user/register', { title: 'Register', messages: req.flash() });
};

// ── POST /register ────────────────────────────────────────────────────────────
export const postRegister = async (req, res) => {
  try {
    const { name, email, password, role, phone,
            class: cls, stream, village, district,
            batch, college, branch, currentStatus } = req.body;

    if (!name || !email || !password || !role) {
      req.flash('error', 'Name, email, password and role are required.');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    // Check all three collections for duplicate email
    const lEmail = email.toLowerCase();
    const [u, s, a] = await Promise.all([
      User.findOne({ email: lEmail }),
      Student.findOne({ email: lEmail }),
      Alumni.findOne({ email: lEmail })
    ]);
    if (u || s || a) {
      req.flash('error', 'This email is already registered.');
      return res.redirect('/register');
    }

    await User.create({
      name, email, password, phone, requestedRole: role,
      class: cls, stream, village, district,
      batch, college, branch, currentStatus,
      status: 'pending'
    });

    req.flash('success', 'Registration submitted! Admin will review your request. You\'ll receive an email once approved.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
};

// ── GET /profile ──────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const { record: user, role } = await getApprovedRecord(req.session);
    if (!user) { req.session.destroy(); return res.redirect('/login'); }
    res.render('user/profile', { title: 'My Profile', user, role, messages: req.flash() });
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
};

// ── POST /profile/update ──────────────────────────────────────────────────────
export const postUpdateProfile = async (req, res) => {
  try {
    const { record: user, role } = await getApprovedRecord(req.session);
    if (!user) return res.redirect('/login');

    const { name, phone, class: cls, stream, village, district,
            batch, college, branch, currentStatus, bio } = req.body;

    user.name  = name  || user.name;
    user.phone = phone || user.phone;

    if (role === 'student') {
      if (cls)      user.class    = cls;
      if (stream)   user.stream   = stream;
      if (village)  user.village  = village;
      if (district) user.district = district;
    } else {
      if (batch)         user.batch         = batch;
      if (college)       user.college       = college;
      if (branch)        user.branch        = branch;
      if (currentStatus) user.currentStatus = currentStatus;
      if (bio)           user.bio           = bio;
    }
    if (req.file) user.photo = req.file.filename;

    await user.save();
    req.session.userName = user.name;
    req.flash('success', 'Profile updated!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Update failed.');
    res.redirect('/profile');
  }
};

// ── GET /forgot-password ──────────────────────────────────────────────────────
export const getForgotPassword = (req, res) =>
  res.render('user/forgot-password', { title: 'Forgot Password', messages: req.flash() });

// ── POST /forgot-password ─────────────────────────────────────────────────────
export const postForgotPassword = async (req, res) => {
  try {
    const lEmail = req.body.email.toLowerCase();
    // Search approved lists first, then pending
    const record = await Student.findOne({ email: lEmail })
                || await Alumni.findOne({ email: lEmail })
                || await User.findOne({ email: lEmail });

    if (!record) {
      req.flash('success', 'If that email is registered, a reset link has been sent.');
      return res.redirect('/forgot-password');
    }

    const rawToken = record.generateResetToken();
    await record.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;
    try { await sendPasswordReset(lEmail, resetUrl); } catch (e) { console.error('Mail:', e.message); }

    req.flash('success', 'Password reset link sent! Check your inbox (and spam folder).');
    res.redirect('/forgot-password');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/forgot-password');
  }
};

// ── GET /reset-password/:token ────────────────────────────────────────────────
export const getResetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const filter = { resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } };
    const record = await Student.findOne(filter) || await Alumni.findOne(filter) || await User.findOne(filter);
    if (!record) {
      req.flash('error', 'Reset link is invalid or expired.');
      return res.redirect('/forgot-password');
    }
    res.render('user/reset-password', { title: 'Reset Password', token: req.params.token, messages: req.flash() });
  } catch {
    req.flash('error', 'Something went wrong.');
    res.redirect('/forgot-password');
  }
};

// ── POST /reset-password/:token ───────────────────────────────────────────────
export const postResetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const filter = { resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } };
    const record = await Student.findOne(filter) || await Alumni.findOne(filter) || await User.findOne(filter);

    if (!record) {
      req.flash('error', 'Reset link is invalid or expired.');
      return res.redirect('/forgot-password');
    }
    const { password, confirmPassword } = req.body;
    if (!password || password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect(`/reset-password/${req.params.token}`);
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect(`/reset-password/${req.params.token}`);
    }

    record.password             = password;
    record.resetPasswordToken   = undefined;
    record.resetPasswordExpires = undefined;
    await record.save();

    req.flash('success', 'Password reset! You can now log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to reset password.');
    res.redirect('/forgot-password');
  }
};

// ── GET /logout ───────────────────────────────────────────────────────────────
export const getLogout = (req, res) => req.session.destroy(() => res.redirect('/login'));

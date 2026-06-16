// controllers/adminController.js
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Admin   from '../models/Admin.js';
import Student from '../models/Student.js';
import Alumni  from '../models/Alumni.js';
import Faculty from '../models/Faculty.js';
import Result  from '../models/Result.js';
import Gallery from '../models/Gallery.js';
import Notice  from '../models/Notice.js';
import Contact from '../models/Contact.js';
import User    from '../models/User.js';
import { sendApprovalNotification } from '../config/mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Helpers ───────────────────────────────────────────────────────────────────
const deleteFile = (filename) => {
  if (!filename) return;
  const p = path.join(__dirname, '../public/uploads', filename);
  if (fs.existsSync(p)) fs.unlinkSync(p);
};

const flash = (req, res, type, msg, redirect) => {
  req.flash(type, msg);
  res.redirect(redirect);
};

// ── ADMIN AUTH ────────────────────────────────────────────────────────────────
export const getLogin = (req, res) =>
  res.render('admin/login', { title: 'Admin Login', error: req.flash('error') });

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password, admin.password))) {
      return flash(req, res, 'error', 'Invalid credentials.', '/admin/login');
    }
    req.session.adminId    = admin._id;
    req.session.adminEmail = admin.email;
    res.redirect('/admin/dashboard');
  } catch {
    flash(req, res, 'error', 'Login failed.', '/admin/login');
  }
};

export const getLogout = (req, res) => req.session.destroy(() => res.redirect('/admin/login'));

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const [studentCount, alumniCount, facultyCount, resultCount,
           galleryCount, noticeCount, contactCount, unreadContacts,
           pendingUsers, recentContacts] = await Promise.all([
      Student.countDocuments(), Alumni.countDocuments(),
      Faculty.countDocuments(), Result.countDocuments(),
      Gallery.countDocuments(), Notice.countDocuments(),
      Contact.countDocuments(), Contact.countDocuments({ isRead: false }),
      User.countDocuments({ status: 'pending' }),
      Contact.find().sort({ createdAt: -1 }).limit(5)
    ]);
    res.render('admin/dashboard', {
      title: 'Dashboard',
      studentCount, alumniCount, facultyCount, resultCount,
      galleryCount, noticeCount, contactCount, unreadContacts,
      pendingUsers, recentContacts
    });
  } catch {
    res.render('admin/dashboard', {
      title: 'Dashboard',
      studentCount:0, alumniCount:0, facultyCount:0, resultCount:0,
      galleryCount:0, noticeCount:0, contactCount:0, unreadContacts:0,
      pendingUsers:0, recentContacts:[]
    });
  }
};

// ── STUDENTS ──────────────────────────────────────────────────────────────────
export const getStudents = async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.render('admin/students', { title: 'Students', students, success: req.flash('success'), error: req.flash('error') });
};

export const getAddStudent = (req, res) =>
  res.render('admin/student-form', { title: 'Add Student', student: null, action: '/admin/students/add' });

export const postAddStudent = async (req, res) => {
  try {
    const { name, class: cls, stream, village, district, phone, email, password } = req.body;
    const data = { name, class: cls, stream, village, district, phone };
    if (req.file)                    data.photo    = req.file.filename;
    if (email)                       data.email    = email.toLowerCase();
    if (password && password.length >= 6) data.password = password;
    await Student.create(data);
    flash(req, res, 'success', 'Student added!', '/admin/students');
  } catch {
    flash(req, res, 'error', 'Failed. Email may already be in use.', '/admin/students');
  }
};

export const getEditStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.redirect('/admin/students');
  res.render('admin/student-form', { title: 'Edit Student', student, action: `/admin/students/edit/${student._id}` });
};

export const postEditStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const { name, class: cls, stream, village, district, phone, email, password } = req.body;
    Object.assign(student, { name, class: cls, stream, village, district, phone });
    if (req.file)   { deleteFile(student.photo); student.photo = req.file.filename; }
    if (email)        student.email    = email.toLowerCase();
    if (password?.length >= 6) student.password = password;
    await student.save();
    flash(req, res, 'success', 'Student updated!', '/admin/students');
  } catch {
    flash(req, res, 'error', 'Update failed.', '/admin/students');
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const s = await Student.findByIdAndDelete(req.params.id);
    if (s?.photo) deleteFile(s.photo);
    req.flash('success', 'Student deleted!');
  } catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/students');
};

// ── ALUMNI ────────────────────────────────────────────────────────────────────
export const getAlumni = async (req, res) => {
  const alumni = await Alumni.find().sort({ batch: -1 });
  res.render('admin/alumni', { title: 'Alumni', alumni, success: req.flash('success'), error: req.flash('error') });
};

export const getAddAlumni = (req, res) =>
  res.render('admin/alumni-form', { title: 'Add Alumni', alumni: null, action: '/admin/alumni/add' });

export const postAddAlumni = async (req, res) => {
  try {
    const { name, batch, college, branch, currentStatus, phone, email, password } = req.body;
    const data = { name, batch, college, branch, currentStatus, phone };
    if (req.file)                    data.photo    = req.file.filename;
    if (email)                       data.email    = email.toLowerCase();
    if (password?.length >= 6)       data.password = password;
    await Alumni.create(data);
    flash(req, res, 'success', 'Alumni added!', '/admin/alumni');
  } catch {
    flash(req, res, 'error', 'Failed. Email may already be in use.', '/admin/alumni');
  }
};

export const getEditAlumni = async (req, res) => {
  const alumni = await Alumni.findById(req.params.id);
  if (!alumni) return res.redirect('/admin/alumni');
  res.render('admin/alumni-form', { title: 'Edit Alumni', alumni, action: `/admin/alumni/edit/${alumni._id}` });
};

export const postEditAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    const { name, batch, college, branch, currentStatus, phone, email, password } = req.body;
    Object.assign(alumni, { name, batch, college, branch, currentStatus, phone });
    if (req.file)   { deleteFile(alumni.photo); alumni.photo = req.file.filename; }
    if (email)        alumni.email    = email.toLowerCase();
    if (password?.length >= 6) alumni.password = password;
    await alumni.save();
    flash(req, res, 'success', 'Alumni updated!', '/admin/alumni');
  } catch {
    flash(req, res, 'error', 'Update failed.', '/admin/alumni');
  }
};

export const deleteAlumni = async (req, res) => {
  try {
    const a = await Alumni.findByIdAndDelete(req.params.id);
    if (a?.photo) deleteFile(a.photo);
    req.flash('success', 'Alumni deleted!');
  } catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/alumni');
};

// ── FACULTY ───────────────────────────────────────────────────────────────────
export const getFaculty    = async (req, res) => {
  const faculty = await Faculty.find().sort({ createdAt: -1 });
  res.render('admin/faculty', { title: 'Faculty', faculty, success: req.flash('success'), error: req.flash('error') });
};
export const getAddFaculty = (req, res) =>
  res.render('admin/faculty-form', { title: 'Add Faculty', faculty: null, action: '/admin/faculty/add' });

export const postAddFaculty = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = req.file.filename;
    await Faculty.create(data);
    flash(req, res, 'success', 'Faculty added!', '/admin/faculty');
  } catch { flash(req, res, 'error', 'Failed.', '/admin/faculty'); }
};
export const getEditFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) return res.redirect('/admin/faculty');
  res.render('admin/faculty-form', { title: 'Edit Faculty', faculty, action: `/admin/faculty/edit/${faculty._id}` });
};
export const postEditFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    const data = { ...req.body };
    if (req.file) { deleteFile(faculty.photo); data.photo = req.file.filename; }
    await Faculty.findByIdAndUpdate(req.params.id, data);
    flash(req, res, 'success', 'Faculty updated!', '/admin/faculty');
  } catch { flash(req, res, 'error', 'Update failed.', '/admin/faculty'); }
};
export const deleteFaculty = async (req, res) => {
  try {
    const f = await Faculty.findByIdAndDelete(req.params.id);
    if (f?.photo) deleteFile(f.photo);
    req.flash('success', 'Faculty deleted!');
  } catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/faculty');
};

// ── RESULTS ───────────────────────────────────────────────────────────────────
export const getResults    = async (req, res) => {
  const results = await Result.find().sort({ year: -1, percentage: -1 });
  res.render('admin/results', { title: 'Results', results, success: req.flash('success'), error: req.flash('error') });
};
export const getAddResult  = (req, res) => res.render('admin/result-form', { title: 'Add Result', result: null, action: '/admin/results/add' });
export const postAddResult = async (req, res) => {
  try { await Result.create(req.body); flash(req, res, 'success', 'Result added!', '/admin/results'); }
  catch { flash(req, res, 'error', 'Failed.', '/admin/results'); }
};
export const getEditResult  = async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) return res.redirect('/admin/results');
  res.render('admin/result-form', { title: 'Edit Result', result, action: `/admin/results/edit/${result._id}` });
};
export const postEditResult = async (req, res) => {
  try { await Result.findByIdAndUpdate(req.params.id, req.body); flash(req, res, 'success', 'Result updated!', '/admin/results'); }
  catch { flash(req, res, 'error', 'Update failed.', '/admin/results'); }
};
export const deleteResult = async (req, res) => {
  try { await Result.findByIdAndDelete(req.params.id); req.flash('success', 'Result deleted!'); }
  catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/results');
};

// ── GALLERY ───────────────────────────────────────────────────────────────────
export const getGallery    = async (req, res) => {
  const gallery = await Gallery.find().sort({ uploadDate: -1 });
  res.render('admin/gallery', { title: 'Gallery', gallery, success: req.flash('success'), error: req.flash('error') });
};
export const postAddGallery = async (req, res) => {
  try {
    if (!req.file) return flash(req, res, 'error', 'Please select an image.', '/admin/gallery');
    await Gallery.create({ title: req.body.title, category: req.body.category, image: req.file.filename });
    flash(req, res, 'success', 'Image uploaded!', '/admin/gallery');
  } catch { flash(req, res, 'error', 'Upload failed.', '/admin/gallery'); }
};
export const deleteGallery = async (req, res) => {
  try { const g = await Gallery.findByIdAndDelete(req.params.id); if (g?.image) deleteFile(g.image); req.flash('success', 'Deleted!'); }
  catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/gallery');
};

// ── NOTICES ───────────────────────────────────────────────────────────────────
export const getNotices    = async (req, res) => {
  const notices = await Notice.find().sort({ date: -1 });
  res.render('admin/notices', { title: 'Notices', notices, success: req.flash('success'), error: req.flash('error') });
};
export const getAddNotice  = (req, res) => res.render('admin/notice-form', { title: 'Add Notice', notice: null, action: '/admin/notices/add' });
export const postAddNotice = async (req, res) => {
  try { await Notice.create(req.body); flash(req, res, 'success', 'Notice added!', '/admin/notices'); }
  catch { flash(req, res, 'error', 'Failed.', '/admin/notices'); }
};
export const getEditNotice  = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.redirect('/admin/notices');
  res.render('admin/notice-form', { title: 'Edit Notice', notice, action: `/admin/notices/edit/${notice._id}` });
};
export const postEditNotice = async (req, res) => {
  try { await Notice.findByIdAndUpdate(req.params.id, req.body); flash(req, res, 'success', 'Notice updated!', '/admin/notices'); }
  catch { flash(req, res, 'error', 'Update failed.', '/admin/notices'); }
};
export const deleteNotice = async (req, res) => {
  try { await Notice.findByIdAndDelete(req.params.id); req.flash('success', 'Notice deleted!'); }
  catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/notices');
};

// ── CONTACTS ──────────────────────────────────────────────────────────────────
export const getContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  await Contact.updateMany({ isRead: false }, { isRead: true });
  res.render('admin/contacts', { title: 'Messages', contacts, success: req.flash('success'), error: req.flash('error') });
};
export const deleteContact = async (req, res) => {
  try { await Contact.findByIdAndDelete(req.params.id); req.flash('success', 'Deleted!'); }
  catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/contacts');
};

// ── USER APPROVALS ────────────────────────────────────────────────────────────
export const getPendingUsers = async (req, res) => {
  try {
    const [pending, rejected, approvedStudents, approvedAlumni] = await Promise.all([
      User.find({ status: 'pending'  }).sort({ createdAt: -1 }),
      User.find({ status: 'rejected' }).sort({ createdAt: -1 }),
      Student.find({ email: { $exists: true, $ne: '' } }).sort({ approvedAt: -1 }).limit(30),
      Alumni.find({  email: { $exists: true, $ne: '' } }).sort({ approvedAt: -1 }).limit(30)
    ]);
    res.render('admin/users', {
      title: 'User Approvals', pending, rejected, approvedStudents, approvedAlumni,
      success: req.flash('success'), error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    flash(req, res, 'error', 'Failed to load users.', '/admin/dashboard');
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return flash(req, res, 'error', 'User not found.', '/admin/users');

    const payload = {
      name: user.name, email: user.email, password: user.password,
      phone: user.phone, photo: user.photo, approvedAt: new Date()
    };

    if (user.requestedRole === 'student') {
      await Student.create({ ...payload, class: user.class || '11th', stream: user.stream || 'Science', village: user.village, district: user.district });
    } else {
      await Alumni.create({ ...payload, batch: user.batch || 'N/A', college: user.college, branch: user.branch, currentStatus: user.currentStatus, bio: user.bio });
    }

    try { await sendApprovalNotification(user.email, user.name, 'approved'); } catch (e) { console.error('Mail:', e.message); }
    await User.findByIdAndDelete(user._id);

    flash(req, res, 'success', `${user.name} approved and moved to official ${user.requestedRole} list!`, '/admin/users');
  } catch (err) {
    console.error(err);
    flash(req, res, 'error', 'Approval failed. Email may already exist.', '/admin/users');
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return flash(req, res, 'error', 'User not found.', '/admin/users');
    user.status = 'rejected';
    user.rejectedReason = req.body.reason || '';
    await user.save({ validateBeforeSave: false });
    try { await sendApprovalNotification(user.email, user.name, 'rejected', user.rejectedReason); } catch (e) { console.error('Mail:', e.message); }
    flash(req, res, 'success', `${user.name}'s request rejected.`, '/admin/users');
  } catch {
    flash(req, res, 'error', 'Rejection failed.', '/admin/users');
  }
};

export const deleteUser = async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); req.flash('success', 'Request deleted.'); }
  catch { req.flash('error', 'Delete failed.'); }
  res.redirect('/admin/users');
};

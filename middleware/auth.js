// middleware/auth.js — Route protection middleware

// Protect admin routes
export function isAdmin(req, res, next) {
  if (req.session?.adminId) return next();
  req.flash('error', 'Please login to access the admin panel.');
  res.redirect('/admin/login');
}

// Protect user (student/alumni) routes
export function isUser(req, res, next) {
  if (req.session?.userId) return next();
  req.flash('error', 'Please login to access this page.');
  res.redirect('/login');
}

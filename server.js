// server.js — Main entry point (ES Module)
import 'dotenv/config';
import express        from 'express';
import session        from 'express-session';
import flash          from 'connect-flash';
import path           from 'path';
import { fileURLToPath } from 'url';

import connectDB   from './config/database.js';
import Admin       from './models/Admin.js';

import publicRoutes from './routes/public.js';
import userRoutes   from './routes/user.js';
import adminRoutes  from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
await connectDB();

// ── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static Files & Body Parsers ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Sessions & Flash Messages ─────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));
app.use(flash());

// ── Global Template Variables (available in every EJS file) ───────────────────
app.use((req, res, next) => {
  res.locals.isAdmin    = !!req.session.adminId;
  res.locals.adminEmail = req.session.adminEmail || null;
  res.locals.isUser     = !!req.session.userId;
  res.locals.userRole   = req.session.userRole   || null;
  res.locals.userModel  = req.session.userModel  || null;
  res.locals.userName   = req.session.userName   || null;
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',       userRoutes);
app.use('/',       publicRoutes);
app.use('/admin',  adminRoutes);

// ── 404 & Error Handlers ──────────────────────────────────────────────────────
app.use((req, res)       => res.status(404).render('404', { title: 'Page Not Found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('404', { title: 'Server Error' });
});

// ── Seed Default Admin (first run only) ───────────────────────────────────────
async function seedAdmin() {
  if (await Admin.countDocuments() === 0) {
    await Admin.create({
      email:    process.env.ADMIN_EMAIL    || 'admin@baliraja.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123'
    });
    console.log('✅ Default admin created → admin@baliraja.com / Admin@123');
  }
}

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await seedAdmin();
  console.log(`🚀 Server running → http://localhost:${PORT}`);
});

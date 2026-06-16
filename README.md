# Baliraja Career Academy Management System

A complete full-stack coaching academy management website built with Node.js, Express, MongoDB, and EJS.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account

### 2. Install Dependencies
```bash
cd BalirajaCareerAcademy
npm install
```

### 3. Configure Environment
Edit `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/baliraja_academy
# For MongoDB Atlas use:
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/baliraja_academy

SESSION_SECRET=your_strong_secret_key_here
ADMIN_EMAIL=admin@baliraja.com
ADMIN_PASSWORD=Admin@123
```

### 4. Run the Application
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 5. (Optional) Seed Sample Data
```bash
node seed.js
```

---

## 🌐 Access

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public website |
| `http://localhost:3000/admin/login` | Admin login |

**Default Admin Credentials:**
- Email: `admin@baliraja.com`
- Password: `Admin@123`

> ⚠️ Change the password after first login!

---

## 📁 Project Structure

```
BalirajaCareerAcademy/
├── config/
│   ├── database.js        # MongoDB connection
│   └── multer.js          # File upload config
├── controllers/
│   ├── publicController.js  # Public pages
│   └── adminController.js   # Admin CRUD
├── middleware/
│   └── auth.js            # Session auth middleware
├── models/
│   ├── Admin.js
│   ├── Student.js
│   ├── Alumni.js
│   ├── Faculty.js
│   ├── Result.js
│   ├── Gallery.js
│   ├── Notice.js
│   └── Contact.js
├── routes/
│   ├── public.js          # Public routes
│   └── admin.js           # Admin routes (protected)
├── views/
│   ├── partials/           # header, footer
│   ├── admin/              # Admin panel views
│   ├── index.ejs           # Home page
│   ├── about.ejs
│   ├── courses.ejs
│   ├── faculty.ejs
│   ├── students.ejs
│   ├── results.ejs
│   ├── gallery.ejs
│   ├── notices.ejs
│   ├── contact.ejs
│   └── 404.ejs
├── public/
│   ├── css/
│   │   ├── style.css      # Public site styles
│   │   └── admin.css      # Admin panel styles
│   ├── js/
│   │   ├── main.js        # Public site JS
│   │   └── admin.js       # Admin panel JS
│   └── uploads/           # Uploaded images
├── .env
├── server.js
├── seed.js                # Sample data seeder
└── package.json
```

---

## ✨ Features

### Public Website
- **Home** – Hero, stats, notices, top results, CTA
- **About** – History, mission, vision, values
- **Courses** – 11th & 12th Science details, admission info
- **Faculty** – Faculty cards with photo, subject, qualification
- **Students** – Current students + Alumni table
- **Results** – Ranked results table
- **Gallery** – Filterable photo gallery
- **Notices** – Announcements board
- **Contact** – Form + Google Maps embed

### Admin Panel
- Secure login with bcrypt password hashing
- Session-based authentication
- Dashboard with stats & quick actions
- Full **CRUD** for: Students, Alumni, Faculty, Results, Notices, Gallery
- View & delete contact messages
- Photo upload via Multer (max 5MB)
- Mobile-responsive sidebar

---

## ☁️ Deploy to Render.com (Free)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add environment variables from `.env`
6. Use MongoDB Atlas for `MONGODB_URI`

---

## 🔒 Security Notes

- Change `SESSION_SECRET` to a long random string in production
- Change default admin password immediately after deployment
- Set `NODE_ENV=production` in production
- Use HTTPS in production

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Templates | EJS |
| Auth | express-session + bcryptjs |
| File Upload | Multer |
| CSS | Custom (no framework) |
| Fonts | Google Fonts (Playfair Display + DM Sans) |
| Icons | Font Awesome 6 |

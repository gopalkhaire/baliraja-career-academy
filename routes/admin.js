// routes/admin.js
import { Router } from 'express';
import * as ctrl  from '../controllers/adminController.js';
import { isAdmin } from '../middleware/auth.js';
import upload      from '../config/multer.js';

const router = Router();

// Auth (no protection)
router.get('/login',  ctrl.getLogin);
router.post('/login', ctrl.postLogin);
router.get('/logout', ctrl.getLogout);

// Dashboard
router.get('/dashboard', isAdmin, ctrl.getDashboard);

// Students
router.get('/students',             isAdmin, ctrl.getStudents);
router.get('/students/add',         isAdmin, ctrl.getAddStudent);
router.post('/students/add',        isAdmin, upload.single('photo'), ctrl.postAddStudent);
router.get('/students/edit/:id',    isAdmin, ctrl.getEditStudent);
router.post('/students/edit/:id',   isAdmin, upload.single('photo'), ctrl.postEditStudent);
router.post('/students/delete/:id', isAdmin, ctrl.deleteStudent);

// Alumni
router.get('/alumni',               isAdmin, ctrl.getAlumni);
router.get('/alumni/add',           isAdmin, ctrl.getAddAlumni);
router.post('/alumni/add',          isAdmin, upload.single('photo'), ctrl.postAddAlumni);
router.get('/alumni/edit/:id',      isAdmin, ctrl.getEditAlumni);
router.post('/alumni/edit/:id',     isAdmin, upload.single('photo'), ctrl.postEditAlumni);
router.post('/alumni/delete/:id',   isAdmin, ctrl.deleteAlumni);

// Faculty
router.get('/faculty',              isAdmin, ctrl.getFaculty);
router.get('/faculty/add',          isAdmin, ctrl.getAddFaculty);
router.post('/faculty/add',         isAdmin, upload.single('photo'), ctrl.postAddFaculty);
router.get('/faculty/edit/:id',     isAdmin, ctrl.getEditFaculty);
router.post('/faculty/edit/:id',    isAdmin, upload.single('photo'), ctrl.postEditFaculty);
router.post('/faculty/delete/:id',  isAdmin, ctrl.deleteFaculty);

// Results
router.get('/results',              isAdmin, ctrl.getResults);
router.get('/results/add',          isAdmin, ctrl.getAddResult);
router.post('/results/add',         isAdmin, ctrl.postAddResult);
router.get('/results/edit/:id',     isAdmin, ctrl.getEditResult);
router.post('/results/edit/:id',    isAdmin, ctrl.postEditResult);
router.post('/results/delete/:id',  isAdmin, ctrl.deleteResult);

// Gallery
router.get('/gallery',              isAdmin, ctrl.getGallery);
router.post('/gallery/add',         isAdmin, upload.single('image'), ctrl.postAddGallery);
router.post('/gallery/delete/:id',  isAdmin, ctrl.deleteGallery);

// Notices
router.get('/notices',              isAdmin, ctrl.getNotices);
router.get('/notices/add',          isAdmin, ctrl.getAddNotice);
router.post('/notices/add',         isAdmin, ctrl.postAddNotice);
router.get('/notices/edit/:id',     isAdmin, ctrl.getEditNotice);
router.post('/notices/edit/:id',    isAdmin, ctrl.postEditNotice);
router.post('/notices/delete/:id',  isAdmin, ctrl.deleteNotice);

// Contacts
router.get('/contacts',             isAdmin, ctrl.getContacts);
router.post('/contacts/delete/:id', isAdmin, ctrl.deleteContact);

// User Approvals
router.get('/users',                isAdmin, ctrl.getPendingUsers);
router.post('/users/approve/:id',   isAdmin, ctrl.approveUser);
router.post('/users/reject/:id',    isAdmin, ctrl.rejectUser);
router.post('/users/delete/:id',    isAdmin, ctrl.deleteUser);

export default router;

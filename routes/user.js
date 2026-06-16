// routes/user.js
import { Router } from 'express';
import * as ctrl  from '../controllers/userAuthController.js';
import { isUser } from '../middleware/auth.js';
import upload     from '../config/multer.js';

const router = Router();

router.get('/login',                ctrl.getLogin);
router.post('/login',               ctrl.postLogin);
router.get('/register',             ctrl.getRegister);
router.post('/register',            ctrl.postRegister);
router.get('/profile',              isUser, ctrl.getProfile);
router.post('/profile/update',      isUser, upload.single('photo'), ctrl.postUpdateProfile);
router.get('/forgot-password',      ctrl.getForgotPassword);
router.post('/forgot-password',     ctrl.postForgotPassword);
router.get('/reset-password/:token', ctrl.getResetPassword);
router.post('/reset-password/:token',ctrl.postResetPassword);
router.get('/logout',               ctrl.getLogout);

export default router;

// routes/public.js
import { Router } from 'express';
import * as ctrl from '../controllers/publicController.js';

const router = Router();

router.get('/',        ctrl.getHome);
router.get('/about',   ctrl.getAbout);
router.get('/courses', ctrl.getCourses);
router.get('/faculty', ctrl.getFaculty);
router.get('/students',ctrl.getStudents);
router.get('/results', ctrl.getResults);
router.get('/gallery', ctrl.getGallery);
router.get('/notices', ctrl.getNotices);
router.get('/contact', ctrl.getContact);
router.post('/contact',ctrl.postContact);

export default router;

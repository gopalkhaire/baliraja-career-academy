// controllers/publicController.js
import Student from '../models/Student.js';
import Alumni  from '../models/Alumni.js';
import Faculty from '../models/Faculty.js';
import Result  from '../models/Result.js';
import Gallery from '../models/Gallery.js';
import Notice  from '../models/Notice.js';
import Contact from '../models/Contact.js';

export const getHome = async (req, res) => {
  try {
    const [studentCount, alumniCount, facultyCount, notices, results] = await Promise.all([
      Student.countDocuments(), Alumni.countDocuments(), Faculty.countDocuments(),
      Notice.find().sort({ date: -1 }).limit(4),
      Result.find().sort({ percentage: -1 }).limit(5)
    ]);
    res.render('index', { title: 'Home', studentCount, alumniCount, facultyCount, notices, results });
  } catch {
    res.render('index', { title: 'Home', studentCount: 0, alumniCount: 0, facultyCount: 0, notices: [], results: [] });
  }
};

export const getAbout   = (req, res) => res.render('about',   { title: 'About Us' });
export const getCourses = (req, res) => res.render('courses', { title: 'Courses' });

export const getFaculty = async (req, res) => {
  const faculty = await Faculty.find().sort({ createdAt: -1 }).catch(() => []);
  res.render('faculty', { title: 'Faculty', faculty });
};

export const getStudents = async (req, res) => {
  const [currentStudents, alumni] = await Promise.all([
    Student.find().sort({ class: 1, name: 1 }),
    Alumni.find().sort({ batch: -1, name: 1 })
  ]).catch(() => [[], []]);
  res.render('students', { title: 'Students & Alumni', currentStudents, alumni });
};

export const getResults = async (req, res) => {
  const results = await Result.find().sort({ year: -1, percentage: -1 }).catch(() => []);
  res.render('results', { title: 'Results', results });
};

export const getGallery = async (req, res) => {
  const gallery    = await Gallery.find().sort({ uploadDate: -1 }).catch(() => []);
  const categories = ['All', 'Event', 'Academic', 'Seminar', 'Function', 'Other'];
  res.render('gallery', { title: 'Gallery', gallery, categories });
};

export const getNotices = async (req, res) => {
  const notices = await Notice.find().sort({ date: -1 }).catch(() => []);
  res.render('notices', { title: 'Notices', notices });
};

export const getContact = (req, res) =>
  res.render('contact', { title: 'Contact Us', success: null, error: null });

export const postContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.render('contact', { title: 'Contact Us', error: 'All fields are required.', success: null });
    await Contact.create({ name, email, message });
    res.render('contact', { title: 'Contact Us', success: 'Message sent! We\'ll reply soon.', error: null });
  } catch {
    res.render('contact', { title: 'Contact Us', error: 'Something went wrong. Try again.', success: null });
  }
};

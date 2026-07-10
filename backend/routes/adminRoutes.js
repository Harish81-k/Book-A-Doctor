import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  getAllDoctors, 
  getAllAppointments, 
  getAllReviews, 
  verifyDoctor, 
  toggleUserActive,
  deleteUser,
  deleteDoctor
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

router.route('/stats').get(getAdminStats);
router.route('/users').get(getAllUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/users/:id/active').put(toggleUserActive);
router.route('/doctors').get(getAllDoctors);
router.route('/doctors/:id').delete(deleteDoctor);
router.route('/doctors/:id/verify').put(verifyDoctor);
router.route('/appointments').get(getAllAppointments);
router.route('/reviews').get(getAllReviews);

export default router;

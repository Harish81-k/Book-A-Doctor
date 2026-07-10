import express from 'express';
import { getDoctors, getDoctorById, updateDoctorProfile, createTimeSlot, getDoctorTimeSlots, getMyDoctorProfile, deleteTimeSlot } from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDoctors);
router.route('/me').get(protect, getMyDoctorProfile);
router.route('/profile').put(protect, updateDoctorProfile);
router.route('/slots').post(protect, createTimeSlot);
router.route('/:id').get(getDoctorById);
router.route('/:id/slots').get(getDoctorTimeSlots);
router.route('/slots/:slotId').delete(protect, deleteTimeSlot);

export default router;

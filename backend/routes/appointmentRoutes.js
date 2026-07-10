import express from 'express';
import { bookAppointment, updateAppointmentStatus, getMyPatientAppointments, getDoctorAppointments, getBookedSlots, getAppointmentById } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, bookAppointment);
router.route('/patient').get(protect, getMyPatientAppointments);
router.route('/doctor').get(protect, getDoctorAppointments);
router.route('/booked-slots/:doctorId/:date').get(getBookedSlots);
router.route('/:id').get(protect, getAppointmentById);
router.route('/:id/status').put(protect, updateAppointmentStatus);

export default router;

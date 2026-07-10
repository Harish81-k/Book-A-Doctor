import express from 'express';
import { createReview, getDoctorReviews, getMyDoctorReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createReview);
router.route('/doctor/me').get(protect, getMyDoctorReviews);
router.route('/doctor/:doctorId').get(getDoctorReviews);

export default router;

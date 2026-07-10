import express from 'express';
import { createPayment, getMyPayments, updatePaymentStatus } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createPayment);
router.route('/me').get(protect, getMyPayments);
router.route('/:id/status').put(protect, updatePaymentStatus);

export default router;

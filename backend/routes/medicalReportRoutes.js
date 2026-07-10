import express from 'express';
import { getMyReports, uploadReport, deleteReport } from '../controllers/medicalReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getMyReports);
router.route('/').post(protect, uploadReport);
router.route('/:id').delete(protect, deleteReport);

export default router;

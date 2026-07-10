import express from 'express';
import { updatePatientProfile } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').put(protect, updatePatientProfile);

export default router;

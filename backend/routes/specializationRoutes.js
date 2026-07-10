import express from 'express';
import { getSpecializations, createSpecialization, deleteSpecialization } from '../controllers/specializationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSpecializations)
  .post(protect, admin, createSpecialization);

router.route('/:id')
  .delete(protect, admin, deleteSpecialization);

export default router;

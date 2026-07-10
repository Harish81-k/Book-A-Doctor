import express from 'express';
import { getMessages, sendMessage, markMessagesAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:appointmentId').get(protect, getMessages);
router.route('/:appointmentId/read').put(protect, markMessagesAsRead);

export default router;

import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(authorizeRoles('superadmin', 'hr'), createNotification);

router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;

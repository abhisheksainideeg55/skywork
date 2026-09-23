import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorizeRoles('superadmin', 'hr'), createAnnouncement);

router.route('/:id')
  .put(authorizeRoles('superadmin', 'hr'), updateAnnouncement)
  .delete(authorizeRoles('superadmin', 'hr'), deleteAnnouncement);

export default router;

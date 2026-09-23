import express from 'express';
import {
  getOvertimes,
  createOvertime,
  updateOvertimeStatus,
  deleteOvertime,
} from '../controllers/overtimeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOvertimes)
  .post(createOvertime);

router.route('/:id/status')
  .put(authorizeRoles('superadmin', 'hr', 'Admin', 'HR'), updateOvertimeStatus);

router.route('/:id')
  .delete(authorizeRoles('superadmin', 'hr', 'Admin', 'HR'), deleteOvertime);

export default router;

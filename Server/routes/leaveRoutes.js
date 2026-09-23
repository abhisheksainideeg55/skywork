import express from 'express';
import {
  getLeaves,
  getLeaveBalance,
  applyLeave,
  updateLeaveStatus,
  cancelLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.get('/balances/:employeeId', getLeaveBalance);
router.patch('/:id/status', authorizeRoles('superadmin', 'hr'), updateLeaveStatus);
router.delete('/:id', cancelLeave);

export default router;

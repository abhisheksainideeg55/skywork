import express from 'express';
import {
  getAttendance,
  getTodayStatus,
  checkIn,
  checkOut,
  updateAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAttendance);
router.get('/today', getTodayStatus);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.put('/:id', authorizeRoles('superadmin', 'hr'), updateAttendance);

export default router;

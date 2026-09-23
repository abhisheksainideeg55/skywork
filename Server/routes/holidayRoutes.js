import express from 'express';
import {
  getHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
} from '../controllers/holidayController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHolidays)
  .post(authorizeRoles('superadmin', 'hr'), addHoliday);

router.route('/:id')
  .put(authorizeRoles('superadmin', 'hr'), updateHoliday)
  .delete(authorizeRoles('superadmin', 'hr'), deleteHoliday);

export default router;

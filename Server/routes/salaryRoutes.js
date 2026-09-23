import express from 'express';
import {
  getSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  processPayout,
} from '../controllers/salaryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSalaries)
  .post(authorizeRoles('superadmin', 'hr'), createSalary);

router.post('/process-payout', authorizeRoles('superadmin', 'hr'), processPayout);

router.route('/:id')
  .get(getSalaryById)
  .put(authorizeRoles('superadmin', 'hr'), updateSalary);

export default router;

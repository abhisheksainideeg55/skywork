import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  issueIdCard,
  updateKYCStatus,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorizeRoles('superadmin', 'hr'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(authorizeRoles('superadmin', 'hr', 'employee'), updateEmployee)
  .delete(authorizeRoles('superadmin', 'hr'), deleteEmployee);

router.post('/:id/id-card', authorizeRoles('superadmin', 'hr'), issueIdCard);
router.put('/:id/kyc', authorizeRoles('superadmin', 'hr'), updateKYCStatus);

export default router;

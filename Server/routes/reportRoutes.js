import express from 'express';
import {
  getReports,
  generateReport,
  updateReport,
  trackDownload,
  deleteReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReports)
  .post(authorizeRoles('superadmin', 'hr', 'Admin', 'HR'), generateReport);

router.route('/:id')
  .put(authorizeRoles('superadmin', 'hr', 'Admin', 'HR'), updateReport)
  .delete(authorizeRoles('superadmin', 'hr', 'Admin', 'HR'), deleteReport);

router.post('/:id/download', trackDownload);

export default router;

import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('superadmin', 'hr'), getAuditLogs)
  .post(createAuditLog);

export default router;

import express from 'express';
import {
  getWFHRequests,
  applyWFH,
  updateWFHStatus,
  cancelWFH,
} from '../controllers/wfhController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWFHRequests)
  .post(applyWFH);

router.patch('/:id/status', authorizeRoles('superadmin', 'hr'), updateWFHStatus);
router.delete('/:id', cancelWFH);

export default router;

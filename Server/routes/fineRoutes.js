import express from 'express';
import {
  getFines,
  getFineById,
  createFine,
  updateFineStatus,
} from '../controllers/fineController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFines)
  .post(authorizeRoles('superadmin', 'hr'), createFine);

router.route('/:id')
  .get(getFineById);

router.put('/:id/status', authorizeRoles('superadmin', 'hr'), updateFineStatus);

export default router;

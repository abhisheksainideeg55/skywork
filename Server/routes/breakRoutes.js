import express from 'express';
import {
  getBreakPolicies,
  addBreakPolicy,
  updateBreakPolicy,
  deleteBreakPolicy,
  getBreakLogs,
  startBreak,
  endBreak,
} from '../controllers/breakController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

// Break Policies
router.route('/policies')
  .get(getBreakPolicies)
  .post(authorizeRoles('superadmin', 'hr'), addBreakPolicy);

router.route('/policies/:id')
  .put(authorizeRoles('superadmin', 'hr'), updateBreakPolicy)
  .delete(authorizeRoles('superadmin', 'hr'), deleteBreakPolicy);

// Break Logs & Realtime Actions
router.get('/logs', getBreakLogs);
router.post('/start', startBreak);
router.post('/end', endBreak);

export default router;


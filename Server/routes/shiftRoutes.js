import express from 'express';
import {
  getShiftDefinitions,
  createShiftDefinition,
  getShiftRoster,
  assignShift,
  bulkAssignShifts,
  updateShiftAllocation,
  deleteShiftAllocation,
} from '../controllers/shiftController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/definitions')
  .get(getShiftDefinitions)
  .post(authorizeRoles('superadmin', 'hr'), createShiftDefinition);

router.get('/roster', getShiftRoster);
router.post('/assign', authorizeRoles('superadmin', 'hr'), assignShift);
router.post('/bulk-assign', authorizeRoles('superadmin', 'hr'), bulkAssignShifts);

router.route('/allocations/:id')
  .put(authorizeRoles('superadmin', 'hr'), updateShiftAllocation)
  .delete(authorizeRoles('superadmin', 'hr'), deleteShiftAllocation);

export default router;

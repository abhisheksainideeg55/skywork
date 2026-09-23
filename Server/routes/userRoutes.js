import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPermissions,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('superadmin', 'hr'), getUsers)
  .post(authorizeRoles('superadmin', 'hr'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(authorizeRoles('superadmin', 'hr'), updateUser)
  .delete(authorizeRoles('superadmin', 'hr'), deleteUser);

router.put('/:id/permissions', authorizeRoles('superadmin'), updateUserPermissions);
router.put('/:id/status', authorizeRoles('superadmin'), toggleUserStatus);

export default router;

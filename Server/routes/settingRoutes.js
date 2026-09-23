import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSettings);

router.route('/:key')
  .put(authorizeRoles('superadmin'), updateSetting);

export default router;

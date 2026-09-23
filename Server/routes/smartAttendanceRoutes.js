import express from 'express';
import {
  getSmartConfig,
  updateSmartConfig,
  addOffice,
  updateOffice,
  deleteOffice,
  addWifiConfig,
  updateWifiConfig,
  deleteWifiConfig,
} from '../controllers/smartAttendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);

// Read configuration (Needed by system/employee check-in)
router.get('/config', getSmartConfig);

// Super Admin Only Operations
router.put('/config', authorizeRoles('superadmin', 'Admin'), updateSmartConfig);

// Office Locations CRUD (Super Admin Only)
router.post('/offices', authorizeRoles('superadmin', 'Admin'), addOffice);
router.put('/offices/:id', authorizeRoles('superadmin', 'Admin'), updateOffice);
router.delete('/offices/:id', authorizeRoles('superadmin', 'Admin'), deleteOffice);

// Wi-Fi Configurations CRUD (Super Admin Only)
router.post('/wifi-configs', authorizeRoles('superadmin', 'Admin'), addWifiConfig);
router.put('/wifi-configs/:id', authorizeRoles('superadmin', 'Admin'), updateWifiConfig);
router.delete('/wifi-configs/:id', authorizeRoles('superadmin', 'Admin'), deleteWifiConfig);

export default router;


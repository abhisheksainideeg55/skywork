import express from 'express';
import {
  getDocuments,
  uploadDocument,
  verifyDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(uploadSingle, uploadDocument);

router.put('/:id/verify', authorizeRoles('superadmin', 'hr'), verifyDocument);
router.delete('/:id', authorizeRoles('superadmin', 'hr'), deleteDocument);

export default router;

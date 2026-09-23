import express from 'express';
import { login, getMe, changePassword, resetPassword, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);

export default router;

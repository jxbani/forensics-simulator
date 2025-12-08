import express from 'express';
import { register, login, getProfile, updatePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.put('/password', authenticate, updatePassword);

export default router;

import express from 'express';
import {
  getUserAchievements,
  awardAchievement,
} from '../controllers/achievementController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All achievement routes require authentication
router.use(authenticate);

router.get('/', getUserAchievements);
router.post('/', awardAchievement);

export default router;

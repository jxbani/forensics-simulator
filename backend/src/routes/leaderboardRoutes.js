import express from 'express';
import {
  getLeaderboard,
  getLevelLeaderboard,
  getDifficultyLeaderboard,
} from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Optional auth - leaderboard can be viewed by anyone, but with auth shows user rank
router.get('/', optionalAuth, getLeaderboard);
router.get('/level/:levelId', optionalAuth, getLevelLeaderboard);
router.get('/difficulty/:difficulty', optionalAuth, getDifficultyLeaderboard);

export default router;

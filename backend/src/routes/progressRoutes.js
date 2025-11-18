import express from 'express';
import {
  getUserProgress,
  submitAnswer,
  useHint,
  completeLevel,
} from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All progress routes require authentication
router.use(authenticate);

router.get('/', getUserProgress);
router.post('/submit', submitAnswer);
router.put('/hint', useHint);
router.post('/complete-level', completeLevel);

export default router;

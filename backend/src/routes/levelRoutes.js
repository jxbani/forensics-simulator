import express from 'express';
import {
  getAllLevels,
  getLevelById,
  getLevelTasks,
} from '../controllers/levelController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Optional auth - levels can be viewed by anyone, but with auth shows progress
router.get('/', optionalAuth, getAllLevels);
router.get('/:id', optionalAuth, getLevelById);
router.get('/:id/tasks', optionalAuth, getLevelTasks);

export default router;

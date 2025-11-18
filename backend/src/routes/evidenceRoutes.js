/**
 * Evidence File Routes
 * Routes for downloading evidence files attached to levels
 * Accessible to all authenticated users
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { downloadEvidenceFile } from '../controllers/adminController.js';

const router = express.Router();

/**
 * GET /api/evidence/:evidenceId/download
 * Download an evidence file
 * Accessible to all authenticated users
 */
router.get('/:evidenceId/download', authenticate, downloadEvidenceFile);

export default router;

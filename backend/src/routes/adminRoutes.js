/**
 * Admin Routes
 * Protected routes for admin panel functionality
 * Requires authentication and admin/moderator role
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOnly } from '../middleware/admin.js';
import { upload } from '../middleware/fileUpload.js';
import {
  // User Management
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  resetUserPassword,

  // Content Management
  createLevel,
  updateLevel,
  deleteLevel,
  createTask,
  updateTask,
  deleteTask,

  // Analytics & Monitoring
  getAnalytics,
  getProgressMonitoring,
  getActivityLogs,

  // Evidence File Management
  uploadEvidenceFile,
  getLevelEvidenceFiles,
  deleteEvidenceFile,
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * All admin routes require authentication
 * Most routes require ADMIN or MODERATOR role
 * Critical operations require ADMIN role only
 */
router.use(authenticate);

// ==================== USER MANAGEMENT ====================

/**
 * GET /api/admin/users
 * Get all users with pagination, filtering, and search
 * Query params: page, limit, search, role
 * Requires: ADMIN or MODERATOR
 */
router.get('/users', requireAdmin, getAllUsers);

/**
 * GET /api/admin/users/:userId
 * Get detailed information about a specific user
 * Includes progress, answers, achievements, uploaded files
 * Requires: ADMIN or MODERATOR
 */
router.get('/users/:userId', requireAdmin, getUserDetails);

/**
 * PUT /api/admin/users/:userId/role
 * Update a user's role (USER, ADMIN, MODERATOR)
 * Body: { role: 'ADMIN' | 'MODERATOR' | 'USER' }
 * Requires: ADMIN only
 */
router.put('/users/:userId/role', requireAdminOnly, updateUserRole);

/**
 * DELETE /api/admin/users/:userId
 * Delete a user and all associated data
 * Cannot delete yourself or other ADMINs (ADMIN role required to delete ADMINs)
 * Requires: ADMIN only
 */
router.delete('/users/:userId', requireAdminOnly, deleteUser);

/**
 * PUT /api/admin/users/:userId/password
 * Reset a user's password (admin function)
 * Body: { newPassword: string }
 * Requires: ADMIN only
 */
router.put('/users/:userId/password', requireAdminOnly, resetUserPassword);

// ==================== CONTENT MANAGEMENT ====================

/**
 * POST /api/admin/levels
 * Create a new forensic training level
 * Body: { title, description, difficulty, orderIndex }
 * Requires: ADMIN or MODERATOR
 */
router.post('/levels', requireAdmin, createLevel);

/**
 * PUT /api/admin/levels/:levelId
 * Update an existing level
 * Body: { title?, description?, difficulty?, orderIndex? }
 * Requires: ADMIN or MODERATOR
 */
router.put('/levels/:levelId', requireAdmin, updateLevel);

/**
 * DELETE /api/admin/levels/:levelId
 * Delete a level and all associated tasks
 * Requires: ADMIN only (destructive operation)
 */
router.delete('/levels/:levelId', requireAdminOnly, deleteLevel);

/**
 * POST /api/admin/levels/:levelId/tasks
 * Create a new task for a specific level
 * Body: { question, type, correctAnswer, points, hint?, orderIndex, evidenceSnippet? }
 * Requires: ADMIN or MODERATOR
 */
router.post('/levels/:levelId/tasks', requireAdmin, createTask);

/**
 * PUT /api/admin/tasks/:taskId
 * Update an existing task
 * Body: { question?, type?, correctAnswer?, points?, hint?, orderIndex?, evidenceSnippet? }
 * Requires: ADMIN or MODERATOR
 */
router.put('/tasks/:taskId', requireAdmin, updateTask);

/**
 * DELETE /api/admin/tasks/:taskId
 * Delete a specific task
 * Requires: ADMIN only (destructive operation)
 */
router.delete('/tasks/:taskId', requireAdminOnly, deleteTask);

// ==================== ANALYTICS & MONITORING ====================

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics dashboard data
 * Returns: user stats, submission stats, growth data, file stats, completion rates
 * Requires: ADMIN or MODERATOR
 */
router.get('/analytics', requireAdmin, getAnalytics);

/**
 * GET /api/admin/progress
 * Monitor user progress across all levels
 * Query params: page, limit, userId, levelId, completed
 * Requires: ADMIN or MODERATOR
 */
router.get('/progress', requireAdmin, getProgressMonitoring);

/**
 * GET /api/admin/activity
 * Get recent activity logs
 * Query params: page, limit, type
 * Returns: answer submissions, level completions, user registrations
 * Requires: ADMIN or MODERATOR
 */
router.get('/activity', requireAdmin, getActivityLogs);

// ==================== EVIDENCE FILE MANAGEMENT ====================

/**
 * POST /api/admin/levels/:levelId/evidence
 * Upload evidence file for a level
 * Body: multipart/form-data with file and optional description
 * Requires: ADMIN or MODERATOR
 */
router.post('/levels/:levelId/evidence', requireAdmin, upload, uploadEvidenceFile);

/**
 * GET /api/admin/levels/:levelId/evidence
 * Get all evidence files for a specific level
 * Requires: ADMIN or MODERATOR
 */
router.get('/levels/:levelId/evidence', requireAdmin, getLevelEvidenceFiles);

/**
 * DELETE /api/admin/evidence/:evidenceId
 * Delete an evidence file
 * Requires: ADMIN only
 */
router.delete('/evidence/:evidenceId', requireAdminOnly, deleteEvidenceFile);

export default router;

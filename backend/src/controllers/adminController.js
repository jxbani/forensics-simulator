import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { emitAdminNotification } from '../config/socket.js';

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, sortBy = 'createdAt', order = 'desc' } = req.query;

    const where = {};

    // Search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role && ['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              progress: true,
              userAnswers: true,
              achievements: true,
              uploadedFiles: true,
            },
          },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
      }),
      prisma.user.count({ where }),
    ]);

    // Get user scores
    const usersWithScores = await Promise.all(
      users.map(async (user) => {
        const progressData = await prisma.progress.aggregate({
          where: { userId: user.id },
          _sum: { score: true },
        });

        const correctAnswers = await prisma.userAnswer.count({
          where: { userId: user.id, isCorrect: true },
        });

        return {
          ...user,
          totalScore: progressData._sum.score || 0,
          correctAnswers,
        };
      })
    );

    res.json({
      users: usersWithScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get specific user details
 * GET /api/admin/users/:userId
 */
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        progress: {
          include: {
            user: { select: { username: true } },
          },
          orderBy: { level: 'asc' },
        },
        userAnswers: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            task: {
              select: {
                question: true,
                type: true,
                level: { select: { title: true } },
              },
            },
          },
        },
        achievements: {
          orderBy: { earnedAt: 'desc' },
        },
        uploadedFiles: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate stats
    const totalScore = user.progress.reduce((sum, p) => sum + p.score, 0);
    const completedLevels = user.progress.filter(p => p.completedAt).length;
    const correctAnswers = user.userAnswers.filter(a => a.isCorrect).length;
    const accuracy = user.userAnswers.length > 0
      ? ((correctAnswers / user.userAnswers.length) * 100).toFixed(2)
      : 0;

    res.json({
      user: {
        ...user,
        stats: {
          totalScore,
          completedLevels,
          totalAnswers: user.userAnswers.length,
          correctAnswers,
          accuracy,
          totalAchievements: user.achievements.length,
          totalFiles: user.uploadedFiles.length,
        },
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

/**
 * Update user role
 * PUT /api/admin/users/:userId/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent self role change
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    emitAdminNotification(`User role updated: ${user.username} → ${role}`, {
      userId,
      newRole: role,
      updatedBy: req.user.id,
      updatedByUsername: req.user.username,
    });

    res.json({ user, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

/**
 * Delete user
 * DELETE /api/admin/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only ADMIN can delete other ADMINs
    if (user.role === 'ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can delete other administrators' });
    }

    await prisma.user.delete({ where: { id: userId } });

    emitAdminNotification(`User deleted: ${user.username}`, {
      userId,
      deletedUser: user.username,
      deletedBy: req.user.username,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Reset user password (admin)
 * PUT /api/admin/users/:userId/password
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    emitAdminNotification('User password reset', {
      userId,
      resetBy: req.user.username,
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ========================================
// CONTENT MANAGEMENT (LEVELS & TASKS)
// ========================================

/**
 * Create new level
 * POST /api/admin/levels
 */
export const createLevel = async (req, res) => {
  try {
    const { title, description, difficulty, orderIndex } = req.body;

    if (!title || !description || !difficulty || orderIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const level = await prisma.level.create({
      data: {
        title,
        description,
        difficulty,
        orderIndex: parseInt(orderIndex),
      },
    });

    emitAdminNotification(`New level created: ${title}`, {
      levelId: level.id,
      createdBy: req.user.username,
    });

    res.status(201).json({ level, message: 'Level created successfully' });
  } catch (error) {
    console.error('Create level error:', error);
    res.status(500).json({ error: 'Failed to create level' });
  }
};

/**
 * Update level
 * PUT /api/admin/levels/:levelId
 */
export const updateLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { title, description, difficulty, orderIndex } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (difficulty) {
      if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level' });
      }
      updateData.difficulty = difficulty;
    }
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex);

    const level = await prisma.level.update({
      where: { id: levelId },
      data: updateData,
      include: {
        tasks: {
          select: { id: true, question: true, points: true },
        },
      },
    });

    res.json({ level, message: 'Level updated successfully' });
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({ error: 'Failed to update level' });
  }
};

/**
 * Delete level
 * DELETE /api/admin/levels/:levelId
 */
export const deleteLevel = async (req, res) => {
  try {
    const { levelId } = req.params;

    const level = await prisma.level.findUnique({
      where: { id: levelId },
      select: { title: true, _count: { select: { tasks: true } } },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    await prisma.level.delete({ where: { id: levelId } });

    emitAdminNotification(`Level deleted: ${level.title}`, {
      levelId,
      tasksDeleted: level._count.tasks,
      deletedBy: req.user.username,
    });

    res.json({ message: 'Level and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Delete level error:', error);
    res.status(500).json({ error: 'Failed to delete level' });
  }
};

/**
 * Create new task
 * POST /api/admin/levels/:levelId/tasks
 */
export const createTask = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { question, type, correctAnswer, points, hint, orderIndex } = req.body;

    if (!question || !type || !correctAnswer || !points || orderIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validTypes = [
      'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILE_ANALYSIS',
      'COMMAND_LINE', 'NETWORK_ANALYSIS', 'MEMORY_FORENSICS', 'DISK_FORENSICS', 'LOG_ANALYSIS'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid task type' });
    }

    const task = await prisma.task.create({
      data: {
        levelId,
        question,
        type,
        correctAnswer,
        points: parseInt(points),
        hint: hint || null,
        orderIndex: parseInt(orderIndex),
      },
    });

    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Update task
 * PUT /api/admin/tasks/:taskId
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { question, type, correctAnswer, points, hint, orderIndex } = req.body;

    const updateData = {};
    if (question) updateData.question = question;
    if (type) updateData.type = type;
    if (correctAnswer) updateData.correctAnswer = correctAnswer;
    if (points !== undefined) updateData.points = parseInt(points);
    if (hint !== undefined) updateData.hint = hint || null;
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Delete task
 * DELETE /api/admin/tasks/:taskId
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await prisma.task.delete({ where: { id: taskId } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// ========================================
// ANALYTICS & STATISTICS
// ========================================

/**
 * Get analytics dashboard data
 * GET /api/admin/analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLevels,
      totalTasks,
      totalSubmissions,
      correctSubmissions,
      totalFiles,
      usersByRole,
      levelStats,
      recentActivity,
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.level.count(),
      prisma.task.count(),
      prisma.userAnswer.count(),
      prisma.userAnswer.count({ where: { isCorrect: true } }),
      prisma.uploadedFile.count(),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),

      // Level completion stats
      prisma.level.findMany({
        select: {
          id: true,
          title: true,
          difficulty: true,
          orderIndex: true,
          _count: {
            select: { tasks: true },
          },
        },
      }),

      // Recent activity (last 20 submissions)
      prisma.userAnswer.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          answer: true,
          isCorrect: true,
          createdAt: true,
          user: {
            select: { id: true, username: true },
          },
          task: {
            select: {
              id: true,
              question: true,
              type: true,
              level: {
                select: { title: true },
              },
            },
          },
        },
      }),
    ]);

    // Get completion stats for each level
    const levelCompletionStats = await Promise.all(
      levelStats.map(async (level) => {
        const completions = await prisma.progress.count({
          where: {
            level: level.orderIndex,
            completedAt: { not: null },
          },
        });

        return {
          ...level,
          completions,
        };
      })
    );

    // Calculate user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    res.json({
      overview: {
        totalUsers,
        totalLevels,
        totalTasks,
        totalSubmissions,
        correctSubmissions,
        accuracy: totalSubmissions > 0 ? ((correctSubmissions / totalSubmissions) * 100).toFixed(2) : 0,
        totalFiles,
        newUsersLast30Days,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {}),
      levelStats: levelCompletionStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

/**
 * Get progress monitoring data
 * GET /api/admin/progress
 */
export const getProgressMonitoring = async (req, res) => {
  try {
    const { page = 1, limit = 50, levelId, completed } = req.query;

    const where = {};
    if (levelId) where.level = levelId;
    if (completed === 'true') where.completedAt = { not: null };
    if (completed === 'false') where.completedAt = null;

    const [progressData, total] = await Promise.all([
      prisma.progress.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { completedAt: 'desc' },
      }),
      prisma.progress.count({ where }),
    ]);

    res.json({
      progress: progressData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get progress monitoring error:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
};

/**
 * Get system activity logs
 * GET /api/admin/activity
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 100, type } = req.query;

    let activities = [];

    // Get recent user answers
    const answers = await prisma.userAnswer.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        isCorrect: true,
        user: { select: { username: true } },
        task: {
          select: {
            question: true,
            level: { select: { title: true } },
          },
        },
      },
    });

    activities = answers.map(a => ({
      type: 'ANSWER_SUBMITTED',
      timestamp: a.createdAt,
      user: a.user.username,
      details: {
        level: a.task.level.title,
        question: a.task.question.substring(0, 100) + '...',
        correct: a.isCorrect,
      },
    }));

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

// ========================================
// EVIDENCE FILE MANAGEMENT
// ========================================

/**
 * Upload evidence file for a level
 * POST /api/admin/levels/:levelId/evidence
 */
export const uploadEvidenceFile = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify level exists
    const level = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Determine file type based on mime type
    let fileType = 'OTHER';
    const mimeType = file.mimetype.toLowerCase();

    if (mimeType.includes('pcap') || file.originalname.match(/\.(pcap|pcapng)$/i)) {
      fileType = 'PCAP';
    } else if (mimeType.includes('application/x-dmp') || file.originalname.match(/\.(raw|mem|dmp|vmem)$/i)) {
      fileType = 'MEMORY_DUMP';
    } else if (file.originalname.match(/\.(dd|img|e01|raw)$/i)) {
      fileType = 'DISK_IMAGE';
    } else if (mimeType.includes('text') || file.originalname.match(/\.(log|txt|evtx)$/i)) {
      fileType = 'LOG_FILE';
    } else if (mimeType.includes('application/x-executable') || file.originalname.match(/\.(exe|dll|elf|bin)$/i)) {
      fileType = 'EXECUTABLE';
    } else if (mimeType.includes('application/pdf') || mimeType.includes('document') || file.originalname.match(/\.(pdf|docx|xlsx)$/i)) {
      fileType = 'DOCUMENT';
    } else if (mimeType.includes('zip') || mimeType.includes('compressed') || file.originalname.match(/\.(zip|tar|gz|7z)$/i)) {
      fileType = 'COMPRESSED';
    }

    // Create evidence file record
    const evidenceFile = await prisma.evidenceFile.create({
      data: {
        levelId,
        originalName: file.originalname,
        storedName: file.filename,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        description: description || null,
      },
    });

    res.status(201).json({
      message: 'Evidence file uploaded successfully',
      evidenceFile,
    });
  } catch (error) {
    console.error('Upload evidence file error:', error);
    res.status(500).json({ error: 'Failed to upload evidence file' });
  }
};

/**
 * Get all evidence files for a level
 * GET /api/admin/levels/:levelId/evidence
 */
export const getLevelEvidenceFiles = async (req, res) => {
  try {
    const { levelId } = req.params;

    const evidenceFiles = await prisma.evidenceFile.findMany({
      where: { levelId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({ evidenceFiles });
  } catch (error) {
    console.error('Get evidence files error:', error);
    res.status(500).json({ error: 'Failed to fetch evidence files' });
  }
};

/**
 * Delete an evidence file
 * DELETE /api/admin/evidence/:evidenceId
 */
export const deleteEvidenceFile = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    // Find the evidence file
    const evidenceFile = await prisma.evidenceFile.findUnique({
      where: { id: evidenceId },
    });

    if (!evidenceFile) {
      return res.status(404).json({ error: 'Evidence file not found' });
    }

    // Delete the file from disk
    const fs = await import('fs/promises');
    try {
      await fs.unlink(evidenceFile.filePath);
    } catch (err) {
      console.error('Error deleting file from disk:', err);
      // Continue anyway - file might already be deleted
    }

    // Delete from database
    await prisma.evidenceFile.delete({
      where: { id: evidenceId },
    });

    res.json({ message: 'Evidence file deleted successfully' });
  } catch (error) {
    console.error('Delete evidence file error:', error);
    res.status(500).json({ error: 'Failed to delete evidence file' });
  }
};

/**
 * Download an evidence file
 * GET /api/evidence/:evidenceId/download
 */
export const downloadEvidenceFile = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    const evidenceFile = await prisma.evidenceFile.findUnique({
      where: { id: evidenceId },
    });

    if (!evidenceFile) {
      return res.status(404).json({ error: 'Evidence file not found' });
    }

    // Check if file exists on disk
    const fs = await import('fs/promises');
    try {
      await fs.access(evidenceFile.filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', evidenceFile.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${evidenceFile.originalName}"`);
    res.setHeader('Content-Length', evidenceFile.fileSize);

    // Stream the file
    const fileStream = await fs.readFile(evidenceFile.filePath);
    res.send(fileStream);
  } catch (error) {
    console.error('Download evidence file error:', error);
    res.status(500).json({ error: 'Failed to download evidence file' });
  }
};

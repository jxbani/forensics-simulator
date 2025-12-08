import prisma from '../config/database.js';

/**
 * Get all levels
 * GET /api/levels
 */
export const getAllLevels = async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        orderIndex: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // If user is authenticated, include their progress
    if (req.user) {
      const userProgress = await prisma.progress.findMany({
        where: { userId: req.user.id },
        select: {
          level: true,
          score: true,
          completedAt: true,
        },
      });

      const progressMap = new Map(
        userProgress.map(p => [p.level, { score: p.score, completedAt: p.completedAt }])
      );

      const levelsWithProgress = levels.map(level => ({
        ...level,
        taskCount: level._count.tasks,
        userProgress: progressMap.get(level.orderIndex) || null,
        _count: undefined,
      }));

      return res.json({ levels: levelsWithProgress });
    }

    // For non-authenticated users
    const levelsPublic = levels.map(level => ({
      ...level,
      taskCount: level._count.tasks,
      _count: undefined,
    }));

    res.json({ levels: levelsPublic });
  } catch (error) {
    console.error('Get all levels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get specific level by ID
 * GET /api/levels/:id
 */
export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;

    const level = await prisma.level.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        orderIndex: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // If user is authenticated, include their progress
    if (req.user) {
      const userProgress = await prisma.progress.findUnique({
        where: {
          userId_level: {
            userId: req.user.id,
            level: level.orderIndex,
          },
        },
      });

      return res.json({
        level: {
          ...level,
          taskCount: level._count.tasks,
          userProgress: userProgress || null,
          _count: undefined,
        },
      });
    }

    res.json({
      level: {
        ...level,
        taskCount: level._count.tasks,
        _count: undefined,
      },
    });
  } catch (error) {
    console.error('Get level by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get tasks for a specific level
 * GET /api/levels/:id/tasks
 */
export const getLevelTasks = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify level exists and get evidence files
    const level = await prisma.level.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        evidenceFiles: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            fileSize: true,
            description: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Get tasks for the level
    const tasks = await prisma.task.findMany({
      where: { levelId: id },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        question: true,
        type: true,
        points: true,
        hint: true,
        orderIndex: true,
        // Don't send correctAnswer to client for security
      },
    });

    // If user is authenticated, include their answers
    if (req.user) {
      const userAnswers = await prisma.userAnswer.findMany({
        where: {
          userId: req.user.id,
          taskId: { in: tasks.map(t => t.id) },
        },
        select: {
          taskId: true,
          answer: true,
          isCorrect: true,
          hintsUsed: true,
          createdAt: true,
        },
      });

      const answersMap = new Map(
        userAnswers.map(a => [a.taskId, a])
      );

      const tasksWithAnswers = tasks.map(task => ({
        ...task,
        userAnswer: answersMap.get(task.id) || null,
      }));

      return res.json({
        level: {
          id: level.id,
          title: level.title,
          orderIndex: level.orderIndex,
          evidenceFiles: level.evidenceFiles,
        },
        tasks: tasksWithAnswers,
      });
    }

    // For non-authenticated users, just return tasks
    res.json({
      level: {
        id: level.id,
        title: level.title,
        orderIndex: level.orderIndex,
        evidenceFiles: level.evidenceFiles,
      },
      tasks,
    });
  } catch (error) {
    console.error('Get level tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

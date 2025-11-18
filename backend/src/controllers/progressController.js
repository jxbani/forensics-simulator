import prisma from '../config/database.js';

/**
 * Get user's progress across all levels
 * GET /api/progress
 */
export const getUserProgress = async (req, res) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.user.id },
      orderBy: { level: 'asc' },
    });

    // Get user answers count
    const answersCount = await prisma.userAnswer.count({
      where: { userId: req.user.id },
    });

    // Get correct answers count
    const correctAnswersCount = await prisma.userAnswer.count({
      where: {
        userId: req.user.id,
        isCorrect: true,
      },
    });

    res.json({
      progress,
      totalLevels: progress.length,
      completedLevels: progress.filter(p => p.completedAt).length,
      totalScore: progress.reduce((sum, p) => sum + p.score, 0),
      totalAnswers: answersCount,
      correctAnswers: correctAnswersCount,
      accuracy: answersCount > 0 ? ((correctAnswersCount / answersCount) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Submit an answer to a task
 * POST /api/progress/submit
 */
export const submitAnswer = async (req, res) => {
  try {
    const { taskId, answer } = req.body;

    if (!taskId || !answer) {
      return res.status(400).json({ error: 'Task ID and answer are required' });
    }

    // Get the task with correct answer
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        level: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user already answered this task
    const existingAnswer = await prisma.userAnswer.findUnique({
      where: {
        userId_taskId: {
          userId: req.user.id,
          taskId: taskId,
        },
      },
    });

    if (existingAnswer) {
      return res.status(400).json({
        error: 'You have already submitted an answer for this task',
        previousAnswer: {
          answer: existingAnswer.answer,
          isCorrect: existingAnswer.isCorrect,
          hintsUsed: existingAnswer.hintsUsed,
        },
      });
    }

    // Check if answer is correct (case-insensitive comparison)
    const isCorrect = answer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();

    // Calculate points (reduce points if hints were used)
    const hintsUsed = 0; // Will be updated when hints are used
    const pointsEarned = isCorrect ? task.points : 0;

    // Create user answer
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: req.user.id,
        taskId: taskId,
        answer: answer.trim(),
        isCorrect,
        hintsUsed,
      },
    });

    // Update or create progress for this level
    if (isCorrect) {
      await prisma.progress.upsert({
        where: {
          userId_level: {
            userId: req.user.id,
            level: task.level.orderIndex,
          },
        },
        update: {
          score: {
            increment: pointsEarned,
          },
        },
        create: {
          userId: req.user.id,
          level: task.level.orderIndex,
          score: pointsEarned,
        },
      });
    }

    res.status(201).json({
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer',
      userAnswer: {
        id: userAnswer.id,
        taskId: userAnswer.taskId,
        answer: userAnswer.answer,
        isCorrect: userAnswer.isCorrect,
        hintsUsed: userAnswer.hintsUsed,
        createdAt: userAnswer.createdAt,
      },
      pointsEarned: isCorrect ? pointsEarned : 0,
      feedback: isCorrect
        ? 'Great job! Your answer is correct.'
        : 'Sorry, that\'s not correct. Try again or use a hint.',
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Use a hint for a task
 * PUT /api/progress/hint
 */
export const useHint = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        hint: true,
        points: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.hint) {
      return res.status(404).json({ error: 'No hint available for this task' });
    }

    // Check if user already answered this task
    const existingAnswer = await prisma.userAnswer.findUnique({
      where: {
        userId_taskId: {
          userId: req.user.id,
          taskId: taskId,
        },
      },
    });

    if (existingAnswer) {
      return res.status(400).json({
        error: 'You have already submitted an answer for this task',
        hint: task.hint,
      });
    }

    // Track hint usage (could be stored in a separate table or session)
    // For now, we'll just return the hint
    // When user submits answer, we can track hints used

    res.json({
      hint: task.hint,
      message: 'Hint revealed! Note: Using hints may reduce your score.',
      pointPenalty: Math.floor(task.points * 0.2), // 20% penalty for using hint
    });
  } catch (error) {
    console.error('Use hint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Complete a level
 * POST /api/progress/complete-level
 */
export const completeLevel = async (req, res) => {
  try {
    const { levelId } = req.body;

    if (!levelId) {
      return res.status(400).json({ error: 'Level ID is required' });
    }

    // Get the level with all tasks
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        tasks: {
          select: {
            id: true,
            points: true,
          },
        },
      },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Get all user answers for this level's tasks
    const taskIds = level.tasks.map(t => t.id);
    const userAnswers = await prisma.userAnswer.findMany({
      where: {
        userId: req.user.id,
        taskId: { in: taskIds },
      },
    });

    // Check if all tasks are answered
    if (userAnswers.length < level.tasks.length) {
      return res.status(400).json({
        error: 'Cannot complete level: Not all tasks have been answered',
        completed: userAnswers.length,
        total: level.tasks.length,
      });
    }

    // Calculate total score
    const correctAnswers = userAnswers.filter(a => a.isCorrect);
    const totalScore = correctAnswers.reduce((sum, answer) => {
      const task = level.tasks.find(t => t.id === answer.taskId);
      return sum + (task ? task.points : 0);
    }, 0);

    // Update progress to mark as completed
    const progress = await prisma.progress.upsert({
      where: {
        userId_level: {
          userId: req.user.id,
          level: level.orderIndex,
        },
      },
      update: {
        completedAt: new Date(),
        score: totalScore,
      },
      create: {
        userId: req.user.id,
        level: level.orderIndex,
        score: totalScore,
        completedAt: new Date(),
      },
    });

    // Check for achievements
    const achievements = [];

    // First level complete
    if (level.orderIndex === 1) {
      const hasAchievement = await prisma.achievement.findUnique({
        where: {
          userId_achievementType: {
            userId: req.user.id,
            achievementType: 'FIRST_LEVEL_COMPLETE',
          },
        },
      });

      if (!hasAchievement) {
        await prisma.achievement.create({
          data: {
            userId: req.user.id,
            achievementType: 'FIRST_LEVEL_COMPLETE',
          },
        });
        achievements.push('FIRST_LEVEL_COMPLETE');
      }
    }

    // Perfect score achievement
    if (correctAnswers.length === level.tasks.length) {
      const hasAchievement = await prisma.achievement.findUnique({
        where: {
          userId_achievementType: {
            userId: req.user.id,
            achievementType: 'PERFECT_SCORE',
          },
        },
      });

      if (!hasAchievement) {
        await prisma.achievement.create({
          data: {
            userId: req.user.id,
            achievementType: 'PERFECT_SCORE',
          },
        });
        achievements.push('PERFECT_SCORE');
      }
    }

    res.json({
      message: 'Level completed successfully!',
      progress,
      stats: {
        totalTasks: level.tasks.length,
        correctAnswers: correctAnswers.length,
        totalScore: totalScore,
        accuracy: ((correctAnswers.length / level.tasks.length) * 100).toFixed(2) + '%',
      },
      achievementsEarned: achievements,
    });
  } catch (error) {
    console.error('Complete level error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

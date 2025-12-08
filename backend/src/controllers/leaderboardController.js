import prisma from '../config/database.js';

/**
 * Get global leaderboard
 * GET /api/leaderboard
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, difficulty } = req.query;

    // Get all users with their total scores
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        progress: {
          select: {
            score: true,
            completedAt: true,
            level: true,
          },
        },
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    });

    // Calculate total scores and stats for each user
    const leaderboard = users.map(user => {
      const totalScore = user.progress.reduce((sum, p) => sum + p.score, 0);
      const completedLevels = user.progress.filter(p => p.completedAt).length;

      return {
        userId: user.id,
        username: user.username,
        totalScore,
        completedLevels,
        achievementsCount: user._count.achievements,
        lastActive: user.progress.length > 0
          ? new Date(Math.max(...user.progress.map(p => new Date(p.completedAt || 0)))).toISOString()
          : user.createdAt.toISOString(),
      };
    });

    // Sort by total score (descending)
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // If scores are equal, sort by completed levels
      if (b.completedLevels !== a.completedLevels) {
        return b.completedLevels - a.completedLevels;
      }
      // If still equal, sort by achievements
      return b.achievementsCount - a.achievementsCount;
    });

    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    // Apply limit
    const limitedLeaderboard = rankedLeaderboard.slice(0, parseInt(limit));

    // If user is authenticated, include their rank
    let userRank = null;
    if (req.user) {
      const userEntry = rankedLeaderboard.find(entry => entry.userId === req.user.id);
      if (userEntry) {
        userRank = {
          ...userEntry,
          isCurrentUser: true,
        };
      }
    }

    res.json({
      leaderboard: limitedLeaderboard,
      total: rankedLeaderboard.length,
      userRank,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get level-specific leaderboard
 * GET /api/leaderboard/level/:levelId
 */
export const getLevelLeaderboard = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { limit = 100 } = req.query;

    // Get the level
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      select: {
        id: true,
        title: true,
        orderIndex: true,
      },
    });

    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Get progress for this specific level
    const progressRecords = await prisma.progress.findMany({
      where: {
        level: level.orderIndex,
        completedAt: { not: null }, // Only completed levels
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: [
        { score: 'desc' },
        { completedAt: 'asc' }, // Earlier completion time as tiebreaker
      ],
    });

    // Format leaderboard
    const leaderboard = progressRecords.map((progress, index) => ({
      rank: index + 1,
      userId: progress.user.id,
      username: progress.user.username,
      score: progress.score,
      completedAt: progress.completedAt,
    }));

    // Apply limit
    const limitedLeaderboard = leaderboard.slice(0, parseInt(limit));

    // If user is authenticated, include their rank for this level
    let userRank = null;
    if (req.user) {
      const userEntry = leaderboard.find(entry => entry.userId === req.user.id);
      if (userEntry) {
        userRank = {
          ...userEntry,
          isCurrentUser: true,
        };
      }
    }

    res.json({
      level: {
        id: level.id,
        title: level.title,
        orderIndex: level.orderIndex,
      },
      leaderboard: limitedLeaderboard,
      total: leaderboard.length,
      userRank,
    });
  } catch (error) {
    console.error('Get level leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get difficulty-based leaderboard
 * GET /api/leaderboard/difficulty/:difficulty
 */
export const getDifficultyLeaderboard = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { limit = 100 } = req.query;

    // Validate difficulty
    const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    if (!validDifficulties.includes(difficulty.toUpperCase())) {
      return res.status(400).json({
        error: 'Invalid difficulty',
        validValues: validDifficulties,
      });
    }

    // Get all levels of this difficulty
    const levels = await prisma.level.findMany({
      where: { difficulty: difficulty.toUpperCase() },
      select: { orderIndex: true },
    });

    if (levels.length === 0) {
      return res.json({
        difficulty: difficulty.toUpperCase(),
        leaderboard: [],
        total: 0,
      });
    }

    const levelIndices = levels.map(l => l.orderIndex);

    // Get all users with their scores for this difficulty
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        progress: {
          where: {
            level: { in: levelIndices },
          },
          select: {
            score: true,
            completedAt: true,
          },
        },
        _count: {
          select: {
            achievements: true,
          },
        },
      },
    });

    // Calculate scores for this difficulty
    const leaderboard = users
      .map(user => {
        const totalScore = user.progress.reduce((sum, p) => sum + p.score, 0);
        const completedLevels = user.progress.filter(p => p.completedAt).length;

        return {
          userId: user.id,
          username: user.username,
          totalScore,
          completedLevels,
          totalLevels: levels.length,
          achievementsCount: user._count.achievements,
        };
      })
      .filter(entry => entry.totalScore > 0) // Only include users with scores
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.completedLevels - a.completedLevels;
      })
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    // Apply limit
    const limitedLeaderboard = leaderboard.slice(0, parseInt(limit));

    // If user is authenticated, include their rank
    let userRank = null;
    if (req.user) {
      const userEntry = leaderboard.find(entry => entry.userId === req.user.id);
      if (userEntry) {
        userRank = {
          ...userEntry,
          isCurrentUser: true,
        };
      }
    }

    res.json({
      difficulty: difficulty.toUpperCase(),
      leaderboard: limitedLeaderboard,
      total: leaderboard.length,
      userRank,
    });
  } catch (error) {
    console.error('Get difficulty leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

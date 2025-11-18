import prisma from '../config/database.js';

/**
 * Get user's achievements
 * GET /api/achievements
 */
export const getUserAchievements = async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.user.id },
      orderBy: { earnedAt: 'desc' },
    });

    res.json({
      achievements,
      totalAchievements: achievements.length,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Award an achievement to user
 * POST /api/achievements
 */
export const awardAchievement = async (req, res) => {
  try {
    const { achievementType } = req.body;

    if (!achievementType) {
      return res.status(400).json({ error: 'Achievement type is required' });
    }

    // Check if achievement already exists
    const existing = await prisma.achievement.findUnique({
      where: {
        userId_achievementType: {
          userId: req.user.id,
          achievementType: achievementType,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Achievement already earned' });
    }

    // Create achievement
    const achievement = await prisma.achievement.create({
      data: {
        userId: req.user.id,
        achievementType: achievementType,
      },
    });

    res.status(201).json({
      message: 'Achievement earned!',
      achievement,
    });
  } catch (error) {
    console.error('Award achievement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Leaderboard Service
 * Handles all leaderboard-related API calls
 */

export const leaderboardService = {
  /**
   * Get global leaderboard
   * @param {number} limit - Number of entries to fetch (default: 100)
   * @returns {Promise<Object>} Leaderboard data
   * @throws {Error} If leaderboard fetch fails
   */
  async getGlobalLeaderboard(limit = 100) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/leaderboard?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      return data;
    } catch (error) {
      console.error('Get global leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch leaderboard. Please try again.');
    }
  },

  /**
   * Get level-specific leaderboard
   * @param {string} levelId - Level ID
   * @param {number} limit - Number of entries to fetch (default: 100)
   * @returns {Promise<Object>} Leaderboard data
   * @throws {Error} If level leaderboard fetch fails
   */
  async getLevelLeaderboard(levelId, limit = 100) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/leaderboard/level/${levelId}?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch level leaderboard');
      }

      return data;
    } catch (error) {
      console.error('Get level leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch level leaderboard. Please try again.');
    }
  },

  /**
   * Get difficulty-based leaderboard
   * @param {string} difficulty - Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
   * @param {number} limit - Number of entries to fetch (default: 100)
   * @returns {Promise<Object>} Leaderboard data
   * @throws {Error} If difficulty leaderboard fetch fails
   */
  async getDifficultyLeaderboard(difficulty, limit = 100) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/leaderboard/difficulty/${difficulty}?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch difficulty leaderboard');
      }

      return data;
    } catch (error) {
      console.error('Get difficulty leaderboard error:', error);
      throw new Error(error.message || 'Failed to fetch difficulty leaderboard. Please try again.');
    }
  },
};

export default leaderboardService;

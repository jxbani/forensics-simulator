const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Progress Service
 * Handles all progress-related API calls
 */

export const progressService = {
  /**
   * Get user's progress across all levels
   * @returns {Promise<Object>} Progress data
   * @throws {Error} If no token found or progress fetch fails
   */
  async getUserProgress() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/progress`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress');
      }

      return data;
    } catch (error) {
      console.error('Get user progress error:', error);
      throw new Error(error.message || 'Failed to fetch progress. Please try again.');
    }
  },

  /**
   * Submit answer to a task
   * @param {string} taskId - Task ID
   * @param {string} answer - User's answer
   * @returns {Promise<Object>} Submission result
   * @throws {Error} If no token found or submission fails
   */
  async submitAnswer(taskId, answer) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/progress/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, answer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      return data;
    } catch (error) {
      console.error('Submit answer error:', error);
      throw new Error(error.message || 'Failed to submit answer. Please try again.');
    }
  },

  /**
   * Request hint for a task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Hint data
   * @throws {Error} If no token found or hint request fails
   */
  async getHint(taskId) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/progress/hint`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get hint');
      }

      return data;
    } catch (error) {
      console.error('Get hint error:', error);
      throw new Error(error.message || 'Failed to get hint. Please try again.');
    }
  },

  /**
   * Complete a level
   * @param {string} levelId - Level ID
   * @returns {Promise<Object>} Completion result
   * @throws {Error} If no token found or level completion fails
   */
  async completeLevel(levelId) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/progress/complete-level`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ levelId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete level');
      }

      return data;
    } catch (error) {
      console.error('Complete level error:', error);
      throw new Error(error.message || 'Failed to complete level. Please try again.');
    }
  },
};

export default progressService;

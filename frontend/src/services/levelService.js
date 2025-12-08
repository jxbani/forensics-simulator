const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Level Service
 * Handles all level-related API calls
 */

export const levelService = {
  /**
   * Get all levels
   * @returns {Promise<Object>} Levels array
   * @throws {Error} If levels fetch fails
   */
  async getAllLevels() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/levels`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch levels');
      }

      return data;
    } catch (error) {
      console.error('Get all levels error:', error);
      throw new Error(error.message || 'Failed to fetch levels. Please try again.');
    }
  },

  /**
   * Get specific level by ID
   * @param {string} levelId - Level ID
   * @returns {Promise<Object>} Level data
   * @throws {Error} If level fetch fails
   */
  async getLevelById(levelId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/levels/${levelId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch level');
      }

      return data;
    } catch (error) {
      console.error('Get level by ID error:', error);
      throw new Error(error.message || 'Failed to fetch level. Please try again.');
    }
  },

  /**
   * Get tasks for a specific level
   * @param {string} levelId - Level ID
   * @returns {Promise<Object>} Level and tasks data
   * @throws {Error} If tasks fetch fails
   */
  async getLevelTasks(levelId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/levels/${levelId}/tasks`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      return data;
    } catch (error) {
      console.error('Get level tasks error:', error);
      throw new Error(error.message || 'Failed to fetch tasks. Please try again.');
    }
  },
};

export default levelService;

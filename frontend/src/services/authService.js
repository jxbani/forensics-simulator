const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   * @throws {Error} If registration fails
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register. Please try again.');
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Username and password
   * @returns {Promise<Object>} User data and token
   * @throws {Error} If login fails
   */
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login. Please try again.');
    }
  },

  /**
   * Logout user and clear authentication data from localStorage
   * @returns {void}
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  /**
   * Get token from localStorage
   * @returns {string|null} JWT token or null
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a token
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Get user profile from API
   * @returns {Promise<Object>} User profile data
   * @throws {Error} If no token found or profile fetch fails
   */
  async getProfile() {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.logout();
        }
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Failed to fetch profile. Please try again.');
    }
  },

  /**
   * Update password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} Success message
   * @throws {Error} If no token found or password update fails
   */
  async updatePassword(passwordData) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password. Please try again.');
    }
  },
};

export default authService;

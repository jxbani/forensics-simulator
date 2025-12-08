const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Admin Service
 * Handles all admin-related API calls
 * Requires ADMIN or MODERATOR role
 */

/**
 * Helper function to get auth headers
 * @returns {Object} Headers with authorization token
 * @throws {Error} If no authentication token found
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Helper function to handle API responses
 * @param {Response} response - Fetch API response
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If response is not ok or request fails
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    } else if (response.status === 403) {
      // Forbidden - insufficient permissions
      throw new Error('Insufficient permissions for this action');
    }
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const adminService = {
  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 50)
   * @param {string} params.search - Search query (default: '')
   * @param {string} params.role - Filter by role (default: '')
   * @returns {Promise<Object>} Users list and pagination info
   * @throws {Error} If authentication fails or request fails
   */
  async getAllUsers({ page = 1, limit = 50, search = '', role = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (role) params.append('role', role);

    const response = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get detailed information about a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Detailed user information
   * @throws {Error} If authentication fails or request fails
   */
  async getUserDetails(userId) {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Update a user's role
   * @param {string} userId - User ID
   * @param {string} role - New role (USER, ADMIN, MODERATOR)
   * @returns {Promise<Object>} Updated user data
   * @throws {Error} If authentication fails or request fails
   */
  async updateUserRole(userId, role) {
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    return handleResponse(response);
  },

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If authentication fails or request fails
   */
  async deleteUser(userId) {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Reset a user's password (admin function)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success message
   * @throws {Error} If authentication fails or request fails
   */
  async resetUserPassword(userId, newPassword) {
    const response = await fetch(`${API_URL}/admin/users/${userId}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });

    return handleResponse(response);
  },

  // ==================== CONTENT MANAGEMENT ====================

  /**
   * Create a new forensic training level
   * @param {Object} levelData - Level data
   * @param {string} levelData.title - Level title
   * @param {string} levelData.description - Level description
   * @param {string} levelData.difficulty - BEGINNER, INTERMEDIATE, or ADVANCED
   * @param {number} levelData.orderIndex - Display order
   * @returns {Promise<Object>} Created level
   * @throws {Error} If authentication fails or request fails
   */
  async createLevel(levelData) {
    const response = await fetch(`${API_URL}/admin/levels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(levelData),
    });

    return handleResponse(response);
  },

  /**
   * Update an existing level
   * @param {string} levelId - Level ID
   * @param {Object} levelData - Updated level data
   * @returns {Promise<Object>} Updated level
   * @throws {Error} If authentication fails or request fails
   */
  async updateLevel(levelId, levelData) {
    const response = await fetch(`${API_URL}/admin/levels/${levelId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(levelData),
    });

    return handleResponse(response);
  },

  /**
   * Delete a level and all associated tasks
   * @param {string} levelId - Level ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If authentication fails or request fails
   */
  async deleteLevel(levelId) {
    const response = await fetch(`${API_URL}/admin/levels/${levelId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Create a new task for a level
   * @param {string} levelId - Level ID
   * @param {Object} taskData - Task data
   * @param {string} taskData.question - Task question
   * @param {string} taskData.type - Task type
   * @param {string} taskData.correctAnswer - Correct answer
   * @param {number} taskData.points - Points awarded
   * @param {string} taskData.hint - Hint (optional)
   * @param {number} taskData.orderIndex - Display order
   * @param {string} taskData.evidenceSnippet - Evidence snippet (optional)
   * @returns {Promise<Object>} Created task
   * @throws {Error} If authentication fails or request fails
   */
  async createTask(levelId, taskData) {
    const response = await fetch(`${API_URL}/admin/levels/${levelId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    return handleResponse(response);
  },

  /**
   * Update an existing task
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task
   * @throws {Error} If authentication fails or request fails
   */
  async updateTask(taskId, taskData) {
    const response = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    return handleResponse(response);
  },

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If authentication fails or request fails
   */
  async deleteTask(taskId) {
    const response = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // ==================== ANALYTICS & MONITORING ====================

  /**
   * Get comprehensive analytics dashboard data
   * @returns {Promise<Object>} Analytics data
   * @throws {Error} If authentication fails or request fails
   */
  async getAnalytics() {
    const response = await fetch(`${API_URL}/admin/analytics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Monitor user progress with filtering
   * @param {Object} filters - Query filters (default: {})
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Results per page
   * @param {string} filters.userId - Filter by user ID
   * @param {string} filters.levelId - Filter by level ID
   * @param {boolean} filters.completed - Filter by completion status
   * @returns {Promise<Object>} Progress data with pagination
   * @throws {Error} If authentication fails or request fails
   */
  async getProgressMonitoring(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    const response = await fetch(`${API_URL}/admin/progress?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get recent activity logs
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 100)
   * @param {string} params.type - Filter by activity type (default: '')
   * @returns {Promise<Object>} Activity logs with pagination
   * @throws {Error} If authentication fails or request fails
   */
  async getActivityLogs({ page = 1, limit = 100, type = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (type) params.append('type', type);

    const response = await fetch(`${API_URL}/admin/activity?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Check if current user has admin privileges
   * @returns {boolean} True if user is ADMIN or MODERATOR
   */
  isAdmin() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      return user.role === 'ADMIN' || user.role === 'MODERATOR';
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if current user is admin only (not moderator)
   * @returns {boolean} True if user is ADMIN
   */
  isAdminOnly() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      return user.role === 'ADMIN';
    } catch (error) {
      return false;
    }
  },

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Get role badge color
   * @param {string} role - User role
   * @returns {string} Color class name
   */
  getRoleBadgeColor(role) {
    switch (role) {
      case 'ADMIN':
        return 'badge-red';
      case 'MODERATOR':
        return 'badge-blue';
      case 'USER':
      default:
        return 'badge-gray';
    }
  },

  /**
   * Get difficulty badge color
   * @param {string} difficulty - Level difficulty
   * @returns {string} Color class name
   */
  getDifficultyBadgeColor(difficulty) {
    switch (difficulty) {
      case 'BEGINNER':
        return 'badge-green';
      case 'INTERMEDIATE':
        return 'badge-yellow';
      case 'ADVANCED':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  },

  // ==================== EVIDENCE FILE MANAGEMENT ====================

  /**
   * Upload evidence file for a level
   * @param {string} levelId - Level ID
   * @param {File} file - File to upload
   * @param {string} description - Optional description
   * @returns {Promise<Object>} Upload result
   * @throws {Error} If authentication fails or upload fails
   */
  async uploadEvidenceFile(levelId, file, description = '') {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${API_URL}/admin/levels/${levelId}/evidence`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });

    return handleResponse(response);
  },

  /**
   * Get evidence files for a level
   * @param {string} levelId - Level ID
   * @returns {Promise<Object>} Evidence files list
   * @throws {Error} If authentication fails or request fails
   */
  async getLevelEvidenceFiles(levelId) {
    const response = await fetch(`${API_URL}/admin/levels/${levelId}/evidence`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Delete an evidence file
   * @param {string} evidenceId - Evidence file ID
   * @returns {Promise<Object>} Deletion result
   * @throws {Error} If authentication fails or request fails
   */
  async deleteEvidenceFile(evidenceId) {
    const response = await fetch(`${API_URL}/admin/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },
};

export default adminService;

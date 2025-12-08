import api from './api';

/**
 * Tool Service for managing forensic tool containers
 * Handles tool lifecycle: start, stop, list, and status operations
 */
class ToolService {
  /**
   * Get list of available forensic tools
   * @returns {Promise<Object>} Object containing success flag and tools array
   * @throws {Error} If request fails
   */
  async getAvailableTools() {
    try {
      const response = await api.get('/tools/available');
      return {
        success: true,
        tools: response.data.tools
      };
    } catch (error) {
      console.error('Failed to get available tools:', error);
      throw new Error(error.response?.data?.error || 'Failed to load tools');
    }
  }

  /**
   * Start a forensic tool container
   * @param {string} toolName - Name of the tool to start
   * @param {Array<string>} evidenceFiles - Array of evidence file names
   * @returns {Promise<Object>} Container information
   * @throws {Error} If tool start fails
   */
  async startTool(toolName, evidenceFiles = []) {
    try {
      const response = await api.post('/tools/start', {
        toolName,
        evidenceFiles
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start tool:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to start tool';
      throw new Error(errorMessage);
    }
  }

  /**
   * Stop a running tool container
   * @param {string} dockerId - Docker container ID
   * @returns {Promise<Object>} Stop operation result
   * @throws {Error} If stop operation fails
   */
  async stopTool(dockerId) {
    try {
      const response = await api.post(`/tools/stop/${dockerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to stop tool:', error);
      throw new Error(error.response?.data?.error || 'Failed to stop tool');
    }
  }

  /**
   * List all active tool containers for current user
   * @returns {Promise<Object>} Object containing success flag and containers array
   */
  async listActiveContainers() {
    try {
      const response = await api.get('/tools/list');
      const containers = response.data.containers.map(container => ({
        ...container,
        tool: container.toolName,
        createdAt: container.created ? new Date(container.created * 1000) : new Date()
      }));

      return {
        success: true,
        containers: containers
      };
    } catch (error) {
      console.error('Failed to list containers:', error);
      return {
        success: false,
        containers: []
      };
    }
  }

  /**
   * Get status of a specific container
   * @param {string} dockerId - Docker container ID
   * @returns {Promise<Object>} Container status information
   * @throws {Error} If status check fails
   */
  async getContainerStatus(dockerId) {
    try {
      const response = await api.get(`/tools/status/${dockerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get container status:', error);
      throw new Error(error.response?.data?.error || 'Failed to get container status');
    }
  }

  /**
   * Check Docker daemon connection status
   * @returns {Promise<Object>} Docker status information
   */
  async checkDockerStatus() {
    try {
      const response = await api.get('/tools/docker-status');
      return response.data;
    } catch (error) {
      console.error('Docker status check failed:', error);
      return {
        connected: false,
        mode: 'unavailable',
        message: 'Cannot check Docker status'
      };
    }
  }
}

export default new ToolService();

import api from './api';

/**
 * File Service for managing evidence file uploads and operations
 * Handles file upload, listing, and deletion for forensic evidence
 */
class FileService {
  /**
   * Upload an evidence file to the server
   * @param {File} file - File object to upload
   * @param {Function} onProgress - Progress callback function (receives percentage)
   * @returns {Promise<Object>} Upload result with file metadata
   * @throws {Error} If upload fails
   */
  async uploadFile(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('evidence', file);

      const response = await api.post('/files/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onProgress) {
              onProgress(percentCompleted);
            }
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(error.response?.data?.error || error.message || 'Upload failed');
    }
  }

  /**
   * Get list of uploaded evidence files for current user
   * @returns {Promise<Array>} Array of file information objects
   */
  async getFileList() {
    try {
      const response = await api.get('/files/evidence/list');
      return response.data.evidence || [];
    } catch (error) {
      console.error('Failed to get file list:', error);
      return [];
    }
  }

  /**
   * Delete an evidence file
   * @param {string} filename - Name of file to delete
   * @returns {Promise<Object>} Deletion result
   * @throws {Error} If deletion fails
   */
  async deleteFile(filename) {
    try {
      const response = await api.delete(`/files/evidence/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete file');
    }
  }
}

export default new FileService();

import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Base directory for uploaded evidence files
 */
const UPLOAD_DIR = path.join(__dirname, '../../uploads/evidence');

/**
 * Maximum file size: 5GB in bytes
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

/**
 * Allowed file extensions for forensic evidence
 * Includes memory dumps, disk images, network captures, and various forensic formats
 */
const ALLOWED_EXTENSIONS = [
  // Memory dumps
  '.raw', '.mem', '.dmp', '.vmem',
  // Disk images
  '.dd', '.img', '.e01', '.aff', '.aff4',
  // Network captures
  '.pcap', '.pcapng', '.cap',
  // Archives and containers
  '.zip', '.tar', '.gz', '.7z', '.rar',
  // Virtual machine files
  '.vmdk', '.vdi', '.vhd', '.vhdx',
  // Mobile forensics
  '.ab', '.tar.gz',
  // Other forensic formats
  '.bin', '.dat', '.log', '.txt', '.csv',
  // Encrypted containers
  '.tc', '.hc'
];

/**
 * FileService manages evidence file uploads, validation, and storage
 * Provides file handling capabilities for forensic analysis tools
 */
class FileService {
  constructor() {
    this.uploadDir = UPLOAD_DIR;
    this.maxFileSize = MAX_FILE_SIZE;
    this.allowedExtensions = ALLOWED_EXTENSIONS;
  }

  /**
   * Configures multer storage with user-specific directory structure
   * Files are organized by user ID to maintain isolation
   * @returns {multer.StorageEngine} Configured multer storage engine
   */
  getMulterStorage() {
    return multer.diskStorage({
      /**
       * Determines destination directory for uploaded file
       * Creates user-specific directory if it doesn't exist
       */
      destination: async (req, file, cb) => {
        try {
          // Extract user ID from authenticated request
          const userId = req.user?.id || req.body.userId || 'anonymous';
          const userDir = path.join(this.uploadDir, userId.toString());

          // Ensure directory exists
          await fs.mkdir(userDir, { recursive: true });

          cb(null, userDir);
        } catch (error) {
          cb(error, null);
        }
      },

      /**
       * Generates unique filename with timestamp and original extension
       * Format: timestamp-originalname
       */
      filename: (req, file, cb) => {
        try {
          // Sanitize original filename
          const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const timestamp = Date.now();
          const filename = `${timestamp}-${sanitizedName}`;

          cb(null, filename);
        } catch (error) {
          cb(error, null);
        }
      }
    });
  }

  /**
   * Validates uploaded file against allowed extensions
   * @param {Object} req - Express request object
   * @param {Object} file - Multer file object
   * @param {Function} cb - Callback function
   */
  fileFilter(req, file, cb) {
    try {
      // Extract file extension (handle multiple extensions like .tar.gz)
      const ext = path.extname(file.originalname).toLowerCase();
      const fullExt = file.originalname.toLowerCase().includes('.tar.gz')
        ? '.tar.gz'
        : ext;

      // Check if extension is allowed
      if (this.allowedExtensions.includes(fullExt) || this.allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed. Allowed extensions: ${this.allowedExtensions.join(', ')}`), false);
      }
    } catch (error) {
      cb(error, false);
    }
  }

  /**
   * Returns configured multer instance for file uploads
   * Includes size limits, file filtering, and storage configuration
   * @returns {multer.Multer} Configured multer instance
   */
  getUploadMiddleware() {
    return multer({
      storage: this.getMulterStorage(),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Maximum 10 files per upload
      }
    });
  }

  /**
   * Validates uploaded file existence and basic properties
   * @param {string} filePath - Path to file to validate
   * @returns {Promise<Object>} Validation result with file stats
   * @throws {Error} If file doesn't exist or is invalid
   */
  async validateFile(filePath) {
    try {
      // Check file exists and get stats
      const stats = await fs.stat(filePath);

      // Verify it's a file (not directory)
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }

      // Verify file size is within limits
      if (stats.size > this.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024 * 1024)}GB`);
      }

      // Verify file is readable
      await fs.access(filePath, fs.constants.R_OK);

      return {
        valid: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: filePath
      };

    } catch (error) {
      console.error(`File validation failed for ${filePath}:`, error);
      throw new Error(`File validation failed: ${error.message}`);
    }
  }

  /**
   * Calculates SHA256 hash of a file for integrity verification
   * Useful for chain of custody and evidence verification
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} SHA256 hash in hexadecimal format
   * @throws {Error} If file cannot be read or hashed
   */
  async calculateFileHash(filePath) {
    try {
      // Create hash stream
      const hash = crypto.createHash('sha256');

      // Read file in chunks to handle large files efficiently
      const fileHandle = await fs.open(filePath, 'r');
      const stream = fileHandle.createReadStream();

      // Process file chunks
      for await (const chunk of stream) {
        hash.update(chunk);
      }

      await fileHandle.close();

      // Return hex digest
      return hash.digest('hex');

    } catch (error) {
      console.error(`Error calculating hash for ${filePath}:`, error);
      throw new Error(`Failed to calculate file hash: ${error.message}`);
    }
  }

  /**
   * Lists all evidence files for a specific user
   * Returns file metadata including size, type, and hash
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of file information objects
   */
  async getEvidenceList(userId) {
    try {
      const userDir = path.join(this.uploadDir, userId.toString());

      // Check if user directory exists
      try {
        await fs.access(userDir);
      } catch {
        // Directory doesn't exist, return empty array
        return [];
      }

      // Read directory contents
      const files = await fs.readdir(userDir);

      // Get detailed information for each file
      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          try {
            const filePath = path.join(userDir, filename);
            const stats = await fs.stat(filePath);

            // Skip directories
            if (!stats.isFile()) {
              return null;
            }

            // Calculate file hash for integrity
            const hash = await this.calculateFileHash(filePath);

            // Detect file type
            const fileType = this.detectFileType(filename);

            return {
              filename,
              path: filePath,
              size: stats.size,
              sizeFormatted: this.formatFileSize(stats.size),
              type: fileType,
              hash: hash,
              uploaded: stats.birthtime,
              modified: stats.mtime,
              extension: path.extname(filename)
            };
          } catch (error) {
            return null;
          }
        })
      );

      // Filter out nulls and return
      return fileDetails.filter(file => file !== null);

    } catch (error) {
      console.error(`Error listing evidence for user ${userId}:`, error);
      throw new Error(`Failed to list evidence files: ${error.message}`);
    }
  }

  /**
   * Detects file type based on extension
   * Categorizes files for display and processing purposes
   * @param {string} filename - Filename to analyze
   * @returns {string} File type category
   */
  detectFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const fullName = filename.toLowerCase();

    // Memory dumps
    if (['.raw', '.mem', '.dmp', '.vmem'].includes(ext)) {
      return 'memory_dump';
    }

    // Disk images
    if (['.dd', '.img', '.e01', '.aff', '.aff4'].includes(ext)) {
      return 'disk_image';
    }

    // Network captures
    if (['.pcap', '.pcapng', '.cap'].includes(ext)) {
      return 'network_capture';
    }

    // Archives
    if (['.zip', '.tar', '.gz', '.7z', '.rar'].includes(ext) || fullName.includes('.tar.gz')) {
      return 'archive';
    }

    // Virtual machine files
    if (['.vmdk', '.vdi', '.vhd', '.vhdx'].includes(ext)) {
      return 'virtual_machine';
    }

    // Mobile forensics
    if (['.ab'].includes(ext)) {
      return 'mobile_backup';
    }

    // Text/logs
    if (['.log', '.txt', '.csv'].includes(ext)) {
      return 'text_log';
    }

    // Generic binary
    return 'binary';
  }

  /**
   * Formats file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size (e.g., "1.5 GB")
   */
  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Deletes a specific evidence file for a user
   * @param {string} userId - User ID
   * @param {string} filename - Filename to delete
   * @returns {Promise<Object>} Deletion result
   * @throws {Error} If file doesn't exist or deletion fails
   */
  async deleteEvidence(userId, filename) {
    try {
      // Validate filename to prevent path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename');
      }

      const filePath = path.join(this.uploadDir, userId.toString(), filename);

      // Verify file exists
      await fs.access(filePath);

      // Delete file
      await fs.unlink(filePath);

      return {
        success: true,
        filename,
        message: 'Evidence file deleted successfully'
      };

    } catch (error) {
      console.error(`Error deleting evidence ${filename} for user ${userId}:`, error);
      throw new Error(`Failed to delete evidence file: ${error.message}`);
    }
  }

  /**
   * Gets the full file path for mounting in Docker containers
   * @param {string} userId - User ID
   * @param {string} filename - Filename
   * @returns {string} Full file path
   * @throws {Error} If filename is invalid
   */
  getFilePath(userId, filename) {
    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }

    return path.join(this.uploadDir, userId.toString(), filename);
  }

  /**
   * Removes files older than 7 days to free up storage
   * Should be run periodically via cron job or scheduled task
   * @returns {Promise<Object>} Cleanup statistics
   */
  async cleanupOldFiles() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const deletedFiles = [];
      const errors = [];

      // Ensure upload directory exists
      try {
        await fs.access(this.uploadDir);
      } catch {
        return {
          success: true,
          deletedCount: 0,
          message: 'Upload directory does not exist'
        };
      }

      // Get all user directories
      const userDirs = await fs.readdir(this.uploadDir);

      for (const userDir of userDirs) {
        const userPath = path.join(this.uploadDir, userDir);

        try {
          const stats = await fs.stat(userPath);

          // Skip if not a directory
          if (!stats.isDirectory()) {
            continue;
          }

          // Get files in user directory
          const files = await fs.readdir(userPath);

          for (const file of files) {
            try {
              const filePath = path.join(userPath, file);
              const fileStats = await fs.stat(filePath);

              // Check if file is older than 7 days
              if (fileStats.mtime < sevenDaysAgo) {
                await fs.unlink(filePath);
                deletedFiles.push({
                  userId: userDir,
                  filename: file,
                  size: fileStats.size,
                  age: Math.floor((Date.now() - fileStats.mtime.getTime()) / (1000 * 60 * 60 * 24))
                });
              }
            } catch (error) {
              errors.push({
                userId: userDir,
                filename: file,
                error: error.message
              });
            }
          }

          // Remove empty user directories
          const remainingFiles = await fs.readdir(userPath);
          if (remainingFiles.length === 0) {
            await fs.rmdir(userPath);
          }

        } catch (error) {
          errors.push({
            userId: userDir,
            error: error.message
          });
        }
      }

      return {
        success: true,
        deletedCount: deletedFiles.length,
        deletedFiles,
        errors,
        message: `Cleaned up ${deletedFiles.length} old files`
      };

    } catch (error) {
      console.error('Error during file cleanup:', error);
      throw new Error(`Failed to cleanup old files: ${error.message}`);
    }
  }
}

// Export singleton instance
const fileService = new FileService();
export default fileService;

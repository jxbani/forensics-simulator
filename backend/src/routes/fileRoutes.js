import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  upload,
  validateFileUpload,
  handleUploadError,
} from '../middleware/fileUpload.js';
import {
  uploadFile,
  getUserFiles,
  getFile,
  downloadFile,
  deleteFile,
  getFileStats,
} from '../controllers/fileController.js';
import fileService from '../services/fileService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/files/upload
 * @desc    Upload a file (evidence file for forensic analysis)
 * @access  Private
 * @body    file - The file to upload
 * @body    taskId (optional) - Associate file with a specific task
 */
router.post(
  '/upload',
  upload,
  handleUploadError,
  validateFileUpload(), // Auto-detect file type
  uploadFile
);

/**
 * @route   GET /api/files
 * @desc    Get user's uploaded files
 * @access  Private
 * @query   taskId (optional) - Filter by task
 * @query   fileType (optional) - Filter by file type
 * @query   limit (optional) - Number of results (default: 50)
 * @query   offset (optional) - Pagination offset (default: 0)
 */
router.get('/', getUserFiles);

/**
 * @route   GET /api/files/stats
 * @desc    Get file upload statistics for the user
 * @access  Private
 */
router.get('/stats', getFileStats);

/**
 * @route   GET /api/files/:fileId
 * @desc    Get specific file metadata
 * @access  Private
 */
router.get('/:fileId', getFile);

/**
 * @route   GET /api/files/:fileId/download
 * @desc    Download a file
 * @access  Private
 */
router.get('/:fileId/download', downloadFile);

/**
 * @route   DELETE /api/files/:fileId
 * @desc    Delete a file
 * @access  Private
 */
router.delete('/:fileId', deleteFile);

// ============================================================================
// Forensic Evidence Management Routes (using fileService)
// ============================================================================

/**
 * @route   POST /api/files/evidence/upload
 * @desc    Upload forensic evidence file with hash calculation
 * @access  Private
 * @body    evidence - Evidence file (multipart/form-data)
 * @returns File metadata including SHA256 hash
 */
router.post('/evidence/upload', (req, res) => {
  // Configure multer upload middleware for forensic evidence
  const uploadEvidence = fileService.getUploadMiddleware().single('evidence');

  // Execute upload
  uploadEvidence(req, res, async (err) => {
    try {
      // Handle upload errors
      if (err) {
        console.error('=== UPLOAD ERROR ===');
        console.error('Error:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);

        // Check if it's a multer error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File too large',
            message: 'File size exceeds maximum allowed size of 5GB'
          });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: 'Too many files',
            message: 'Maximum 10 files allowed per upload'
          });
        }

        return res.status(400).json({
          success: false,
          error: 'Upload error',
          message: err.message || 'Failed to upload evidence file'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        console.error('=== NO FILE IN REQUEST ===');
        console.error('req.body:', req.body);
        console.error('req.files:', req.files);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'No file provided. Please upload an evidence file.'
        });
      }

      const userId = req.user.id;
      const file = req.file;

      // Validate uploaded file
      const validation = await fileService.validateFile(file.path);

      if (!validation.valid) {
        console.error('File validation failed');
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Evidence file validation failed'
        });
      }

      // Calculate file hash for chain of custody
      const hash = await fileService.calculateFileHash(file.path);

      // Detect file type
      const fileType = fileService.detectFileType(file.filename);

      // Format file size
      const sizeFormatted = fileService.formatFileSize(file.size);

      // Return evidence metadata
      res.status(201).json({
        success: true,
        message: 'Evidence file uploaded successfully',
        data: {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          sizeFormatted: sizeFormatted,
          type: fileType,
          sha256: hash,
          uploadedAt: new Date().toISOString(),
          path: file.path,
          mimetype: file.mimetype
        }
      });

    } catch (error) {
      console.error('=== ERROR PROCESSING UPLOAD ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to process evidence file'
      });
    }
  });
});

/**
 * @route   GET /api/files/evidence/list
 * @desc    Lists all forensic evidence files for the authenticated user
 * @access  Private
 * @returns Array of evidence files with metadata, hashes, and types
 */
router.get('/evidence/list', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get evidence list with full metadata
    const files = await fileService.getEvidenceList(userId);

    res.status(200).json({
      success: true,
      evidence: files,
      count: files.length,
      message: `Found ${files.length} evidence file(s)`
    });

  } catch (error) {
    console.error('=== ERROR LISTING EVIDENCE FILES ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to list evidence files'
    });
  }
});

/**
 * @route   DELETE /api/files/evidence/:filename
 * @desc    Deletes a specific forensic evidence file
 * @access  Private
 * @param   filename - Name of evidence file to delete
 * @returns Success message
 */
router.delete('/evidence/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    if (!filename) {
      console.error('No filename provided');
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Filename is required'
      });
    }

    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error('Invalid filename (path traversal attempt):', filename);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid filename'
      });
    }

    // Delete evidence file
    const result = await fileService.deleteEvidence(userId, filename);

    res.status(200).json({
      success: true,
      message: 'Evidence file deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('=== ERROR DELETING EVIDENCE FILE ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    // Check if file not found
    if (error.message.includes('ENOENT') || error.message.includes('not exist')) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Evidence file not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to delete evidence file'
    });
  }
});

/**
 * @route   GET /api/files/evidence/download/:filename
 * @desc    Downloads a specific forensic evidence file
 * @access  Private
 * @param   filename - Name of evidence file to download
 * @returns File download
 */
router.get('/evidence/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Filename is required'
      });
    }

    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid filename'
      });
    }

    // Get file path
    const filePath = fileService.getFilePath(userId, filename);

    // Validate file exists and is accessible
    try {
      await fileService.validateFile(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Evidence file not found'
      });
    }

    // Extract original filename (remove timestamp prefix if present)
    const originalName = filename.includes('-')
      ? filename.substring(filename.indexOf('-') + 1)
      : filename;

    // Send file for download
    res.download(filePath, originalName, (err) => {
      if (err) {
        console.error('Error sending evidence file:', err);

        // Only send error response if headers haven't been sent
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to download evidence file'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error downloading evidence file:', error);

    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to download evidence file'
      });
    }
  }
});

/**
 * @route   GET /api/files/evidence/hash/:filename
 * @desc    Calculates and returns SHA256 hash of an evidence file
 * @access  Private
 * @param   filename - Name of evidence file
 * @returns SHA256 hash for integrity verification
 */
router.get('/evidence/hash/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Filename is required'
      });
    }

    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid filename'
      });
    }

    // Get file path
    const filePath = fileService.getFilePath(userId, filename);

    // Validate file exists
    try {
      await fileService.validateFile(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Evidence file not found'
      });
    }

    // Calculate hash
    const hash = await fileService.calculateFileHash(filePath);

    res.status(200).json({
      success: true,
      data: {
        filename: filename,
        sha256: hash,
        algorithm: 'SHA256',
        calculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error calculating evidence hash:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to calculate evidence hash'
    });
  }
});

export default router;

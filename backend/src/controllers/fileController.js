import prisma from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Upload a file
 * POST /api/files/upload
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const { taskId } = req.body;
    const { fileType, originalName, storedName, mimeType, fileSize, filePath } = req.fileMetadata;

    // Validate taskId if provided
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        // Clean up uploaded file
        await fs.unlink(filePath);
        return res.status(404).json({ error: 'Task not found' });
      }
    }

    // Create database record
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId,
        taskId: taskId || null,
        originalName,
        storedName,
        fileType,
        mimeType,
        fileSize,
        filePath,
      },
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: uploadedFile.id,
        originalName: uploadedFile.originalName,
        fileType: uploadedFile.fileType,
        fileSize: uploadedFile.fileSize,
        uploadedAt: uploadedFile.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);

    // Clean up file if database operation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Get user's uploaded files
 * GET /api/files
 */
export const getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId, fileType, limit = 50, offset = 0 } = req.query;

    const where = { userId };

    if (taskId) {
      where.taskId = taskId;
    }

    if (fileType) {
      where.fileType = fileType;
    }

    const [files, totalCount] = await Promise.all([
      prisma.uploadedFile.findMany({
        where,
        select: {
          id: true,
          originalName: true,
          fileType: true,
          mimeType: true,
          fileSize: true,
          taskId: true,
          uploadedAt: true,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.uploadedFile.count({ where }),
    ]);

    res.json({
      files,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + files.length,
      },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

/**
 * Get specific file metadata
 * GET /api/files/:fileId
 */
export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await prisma.uploadedFile.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      file: {
        id: file.id,
        originalName: file.originalName,
        fileType: file.fileType,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        taskId: file.taskId,
        uploadedAt: file.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
};

/**
 * Download a file
 * GET /api/files/:fileId/download
 */
export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await prisma.uploadedFile.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.fileSize);

    // Stream the file
    const fileStream = await fs.readFile(file.filePath);
    res.send(fileStream);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

/**
 * Delete a file
 * DELETE /api/files/:fileId
 */
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await prisma.uploadedFile.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue with database deletion even if file doesn't exist
    }

    // Delete database record
    await prisma.uploadedFile.delete({
      where: { id: fileId },
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

/**
 * Get file upload statistics
 * GET /api/files/stats
 */
export const getFileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalFiles, totalSize, filesByType] = await Promise.all([
      prisma.uploadedFile.count({ where: { userId } }),
      prisma.uploadedFile.aggregate({
        where: { userId },
        _sum: { fileSize: true },
      }),
      prisma.uploadedFile.groupBy({
        by: ['fileType'],
        where: { userId },
        _count: { fileType: true },
        _sum: { fileSize: true },
      }),
    ]);

    res.json({
      stats: {
        totalFiles,
        totalSize: totalSize._sum.fileSize || 0,
        filesByType: filesByType.map((item) => ({
          type: item.fileType,
          count: item._count.fileType,
          totalSize: item._sum.fileSize || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({ error: 'Failed to fetch file statistics' });
  }
};

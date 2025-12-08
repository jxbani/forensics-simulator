import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// File type mappings
const FILE_TYPE_CONFIG = {
  PCAP: {
    extensions: ['.pcap', '.pcapng', '.cap'],
    mimeTypes: ['application/vnd.tcpdump.pcap', 'application/octet-stream'],
    directory: 'pcap',
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  MEMORY_DUMP: {
    extensions: ['.raw', '.mem', '.dmp', '.vmem', '.bin'],
    mimeTypes: ['application/octet-stream'],
    directory: 'memory',
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
  DISK_IMAGE: {
    extensions: ['.dd', '.img', '.e01', '.raw', '.iso'],
    mimeTypes: ['application/octet-stream', 'application/x-iso9660-image'],
    directory: 'disk',
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
  },
  LOG_FILE: {
    extensions: ['.log', '.txt', '.evtx', '.syslog'],
    mimeTypes: ['text/plain', 'application/octet-stream'],
    directory: 'logs',
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  EXECUTABLE: {
    extensions: ['.exe', '.dll', '.elf', '.bin', '.so', '.dylib'],
    mimeTypes: ['application/x-msdownload', 'application/octet-stream', 'application/x-executable'],
    directory: 'executables',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  DOCUMENT: {
    extensions: ['.pdf', '.docx', '.xlsx', '.doc', '.xls'],
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
    ],
    directory: 'documents',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  COMPRESSED: {
    extensions: ['.zip', '.tar', '.gz', '.7z', '.rar', '.tar.gz', '.tgz'],
    mimeTypes: [
      'application/zip',
      'application/x-tar',
      'application/gzip',
      'application/x-7z-compressed',
      'application/x-rar-compressed',
      'application/octet-stream',
    ],
    directory: 'compressed',
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  OTHER: {
    extensions: [],
    mimeTypes: ['application/octet-stream'],
    directory: 'other',
    maxSize: 100 * 1024 * 1024, // 100MB
  },
};

// Determine file type based on extension
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();

  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (config.extensions.includes(ext)) {
      return type;
    }
  }

  return 'OTHER';
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = getFileType(file.originalname);
    const directory = FILE_TYPE_CONFIG[fileType].directory;
    const uploadPath = path.join(process.cwd(), 'uploads', directory);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random hash
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomHash}${ext}`;
    cb(null, filename);
  },
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const fileType = getFileType(file.originalname);
  const config = FILE_TYPE_CONFIG[fileType];

  // Validate MIME type
  if (!config.mimeTypes.includes(file.mimetype) && fileType !== 'OTHER') {
    return cb(
      new Error(
        `Invalid file type. Expected: ${config.mimeTypes.join(', ')}, Got: ${file.mimetype}`
      ),
      false
    );
  }

  // Store file type in request for later use
  req.detectedFileType = fileType;
  cb(null, true);
};

// Create multer upload middleware with size limits
export const createUploadMiddleware = (fileType) => {
  const config = FILE_TYPE_CONFIG[fileType] || FILE_TYPE_CONFIG.OTHER;

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize,
      files: 1, // Allow one file at a time
    },
  }).single('file'); // Expect field name 'file'
};

// General upload middleware (auto-detects type)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // Default 10GB
    files: 1,
  },
}).single('file');

// File validation middleware
export const validateFileUpload = (allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = req.detectedFileType || getFileType(req.file.originalname);

    // Check if file type is allowed
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileType)) {
      return res.status(400).json({
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        uploadedType: fileType,
      });
    }

    // Add file metadata to request
    req.fileMetadata = {
      fileType,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
    };

    next();
  };
};

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        maxSize: err.limit,
        uploadedSize: err.field,
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        expectedField: 'file',
      });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  next();
};

// Helper to get file type configuration
export const getFileTypeConfig = (fileType) => {
  return FILE_TYPE_CONFIG[fileType] || FILE_TYPE_CONFIG.OTHER;
};

// Export file type constants
export { FILE_TYPE_CONFIG };

/**
 * Test Helpers and Utilities
 */

import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../src/utils/jwt.js';

/**
 * Generate a mock user object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user object
 */
export const generateMockUser = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'USER',
    createdAt: faker.date.past(),
    ...overrides,
  };
};

/**
 * Generate a hashed password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Generate a JWT token for testing
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export const generateTestToken = (user) => {
  return generateToken({ userId: user.id, role: user.role });
};

/**
 * Generate a mock level object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock level object
 */
export const generateMockLevel = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    difficulty: faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    orderIndex: faker.number.int({ min: 1, max: 10 }),
    createdAt: faker.date.past(),
    ...overrides,
  };
};

/**
 * Generate a mock task object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock task object
 */
export const generateMockTask = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    levelId: faker.string.uuid(),
    question: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['LOG_ANALYSIS', 'FILE_ANALYSIS', 'NETWORK_ANALYSIS', 'MEMORY_FORENSICS']),
    correctAnswer: faker.lorem.word(),
    points: faker.number.int({ min: 10, max: 50 }),
    hint: faker.lorem.sentence(),
    orderIndex: faker.number.int({ min: 1, max: 10 }),
    evidenceSnippet: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    ...overrides,
  };
};

/**
 * Generate a mock progress object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock progress object
 */
export const generateMockProgress = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    levelId: faker.string.uuid(),
    score: faker.number.int({ min: 0, max: 100 }),
    completedAt: null,
    hintsUsed: faker.number.int({ min: 0, max: 5 }),
    createdAt: faker.date.past(),
    ...overrides,
  };
};

/**
 * Generate a mock user answer object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user answer object
 */
export const generateMockUserAnswer = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    taskId: faker.string.uuid(),
    answer: faker.lorem.word(),
    isCorrect: faker.datatype.boolean(),
    pointsEarned: faker.number.int({ min: 0, max: 50 }),
    createdAt: faker.date.past(),
    ...overrides,
  };
};

/**
 * Generate a mock uploaded file object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock uploaded file object
 */
export const generateMockFile = (overrides = {}) => {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    taskId: faker.string.uuid(),
    originalName: faker.system.fileName(),
    storedName: `${Date.now()}-${faker.string.alphanumeric(8)}.pcap`,
    fileType: faker.helpers.arrayElement(['PCAP', 'MEMORY_DUMP', 'DISK_IMAGE', 'LOG_FILE']),
    mimeType: 'application/octet-stream',
    fileSize: faker.number.int({ min: 1024, max: 10485760 }),
    filePath: `/uploads/pcap/${faker.string.alphanumeric(16)}.pcap`,
    uploadedAt: faker.date.past(),
    ...overrides,
  };
};

/**
 * Create a mock Prisma client for testing
 * @returns {Object} Mock Prisma client
 */
export const createMockPrisma = () => {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    level: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    progress: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    userAnswer: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    uploadedFile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    achievement: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
};

/**
 * Create mock Express request object
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
export const createMockRequest = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
    file: options.file || null,
    ...options,
  };
};

/**
 * Create mock Express response object
 * @returns {Object} Mock response object
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Create mock Express next function
 * @returns {Function} Mock next function
 */
export const createMockNext = () => {
  return jest.fn();
};

/**
 * Wait for a specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified duration
 */
export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Clean up test database (if needed)
 * @param {Object} prisma - Prisma client
 * @returns {Promise<void>}
 */
export const cleanupTestDatabase = async (prisma) => {
  // Delete in correct order to respect foreign key constraints
  await prisma.userAnswer.deleteMany({});
  await prisma.uploadedFile.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.level.deleteMany({});
  await prisma.user.deleteMany({});
};

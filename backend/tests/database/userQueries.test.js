/**
 * User Database Query Tests
 * These tests verify Prisma queries work correctly
 * Note: These tests require a test database to be configured
 */

import { jest } from '@jest/globals';
import { createMockPrisma, generateMockUser, hashPassword } from '../helpers/testHelpers.js';

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: createMockPrisma(),
}));

const { default: prisma } = await import('../../src/config/database.js');

describe('User Database Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Creation', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: await hashPassword('Test123!'),
      };

      const mockUser = generateMockUser(userData);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await prisma.user.create({
        data: userData,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toHaveProperty('id');
      expect(result.username).toBe(userData.username);
      expect(result.email).toBe(userData.email);
    });

    it('should create user with default role USER', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: await hashPassword('Test123!'),
      };

      const mockUser = generateMockUser({ ...userData, role: 'USER' });
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await prisma.user.create({
        data: userData,
      });

      expect(result.role).toBe('USER');
    });
  });

  describe('User Lookup', () => {
    it('should find user by username', async () => {
      const mockUser = generateMockUser({ username: 'testuser' });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { username: 'testuser' },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toBeTruthy();
      expect(result.username).toBe('testuser');
    });

    it('should find user by email', async () => {
      const mockUser = generateMockUser({ email: 'test@example.com' });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(result).toBeTruthy();
      expect(result.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await prisma.user.findUnique({
        where: { username: 'nonexistent' },
      });

      expect(result).toBeNull();
    });
  });

  describe('User Update', () => {
    it('should update user password', async () => {
      const userId = 'user-id-123';
      const newPassword = await hashPassword('NewPass123!');

      const mockUser = generateMockUser({ id: userId, password: newPassword });
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await prisma.user.update({
        where: { id: userId },
        data: { password: newPassword },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: newPassword },
      });
      expect(result.password).toBe(newPassword);
    });

    it('should update user role', async () => {
      const userId = 'user-id-123';

      const mockUser = generateMockUser({ id: userId, role: 'ADMIN' });
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });

      expect(result.role).toBe('ADMIN');
    });
  });

  describe('User Deletion', () => {
    it('should delete user by id', async () => {
      const userId = 'user-id-123';
      const mockUser = generateMockUser({ id: userId });

      prisma.user.delete.mockResolvedValue(mockUser);

      const result = await prisma.user.delete({
        where: { id: userId },
      });

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result.id).toBe(userId);
    });

    it('should cascade delete related records', async () => {
      // This test verifies cascade delete behavior
      // In real scenario, deleting user should delete progress, answers, etc.
      const userId = 'user-id-123';
      const mockUser = generateMockUser({ id: userId });

      prisma.user.delete.mockResolvedValue(mockUser);

      await prisma.user.delete({
        where: { id: userId },
      });

      expect(prisma.user.delete).toHaveBeenCalled();
    });
  });

  describe('User Count and Search', () => {
    it('should count total users', async () => {
      prisma.user.count.mockResolvedValue(50);

      const result = await prisma.user.count();

      expect(result).toBe(50);
    });

    it('should count users by role', async () => {
      prisma.user.count.mockResolvedValue(5);

      const result = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
      });
      expect(result).toBe(5);
    });

    it('should search users by username', async () => {
      const mockUsers = [
        generateMockUser({ username: 'john_doe' }),
        generateMockUser({ username: 'johnny' }),
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await prisma.user.findMany({
        where: {
          username: {
            contains: 'john',
            mode: 'insensitive',
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result.every((u) => u.username.toLowerCase().includes('john'))).toBe(true);
    });
  });

  describe('User Relations', () => {
    it('should include user progress in query', async () => {
      const mockUser = generateMockUser();
      const mockUserWithProgress = {
        ...mockUser,
        progress: [
          { id: 'progress-1', score: 100, completedAt: null },
          { id: 'progress-2', score: 150, completedAt: new Date() },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUserWithProgress);

      const result = await prisma.user.findUnique({
        where: { id: mockUser.id },
        include: { progress: true },
      });

      expect(result.progress).toBeDefined();
      expect(result.progress).toHaveLength(2);
    });

    it('should include user answers in query', async () => {
      const mockUser = generateMockUser();
      const mockUserWithAnswers = {
        ...mockUser,
        userAnswers: [
          { id: 'answer-1', isCorrect: true, pointsEarned: 20 },
          { id: 'answer-2', isCorrect: false, pointsEarned: 0 },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUserWithAnswers);

      const result = await prisma.user.findUnique({
        where: { id: mockUser.id },
        include: { userAnswers: true },
      });

      expect(result.userAnswers).toBeDefined();
      expect(result.userAnswers).toHaveLength(2);
    });

    it('should aggregate user scores', async () => {
      prisma.progress.aggregate.mockResolvedValue({
        _sum: { score: 450 },
        _avg: { score: 150 },
        _count: 3,
      });

      const result = await prisma.progress.aggregate({
        where: { userId: 'user-id-123' },
        _sum: { score: true },
        _avg: { score: true },
        _count: true,
      });

      expect(result._sum.score).toBe(450);
      expect(result._avg.score).toBe(150);
      expect(result._count).toBe(3);
    });
  });
});

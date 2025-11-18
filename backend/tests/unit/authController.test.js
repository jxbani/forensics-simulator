/**
 * Auth Controller Unit Tests
 */

import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import {
  createMockRequest,
  createMockResponse,
  createMockPrisma,
  generateMockUser,
  hashPassword,
} from '../helpers/testHelpers.js';

// Mock dependencies
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: createMockPrisma(),
}));

jest.unstable_mockModule('../../src/utils/jwt.js', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  verifyToken: jest.fn(() => ({ userId: 'user-id-123' })),
}));

const { default: prisma } = await import('../../src/config/database.js');
const { generateToken } = await import('../../src/utils/jwt.js');
const { register, login, getProfile, updatePassword } = await import('../../src/controllers/authController.js');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = createMockRequest({
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123!',
        },
      });
      const res = createMockResponse();

      const mockUser = generateMockUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      await register(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2); // Check username and email
      expect(prisma.user.create).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com',
          }),
          token: 'mock-jwt-token',
        })
      );
    });

    it('should return 400 if username already exists', async () => {
      const req = createMockRequest({
        body: {
          username: 'existinguser',
          email: 'new@example.com',
          password: 'Test123!',
        },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValueOnce(generateMockUser()); // Username exists

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Username'),
        })
      );
    });

    it('should return 400 if email already exists', async () => {
      const req = createMockRequest({
        body: {
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Test123!',
        },
      });
      const res = createMockResponse();

      prisma.user.findUnique
        .mockResolvedValueOnce(null) // Username doesn't exist
        .mockResolvedValueOnce(generateMockUser()); // Email exists

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Email'),
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const req = createMockRequest({
        body: {
          username: 'testuser',
          // Missing email and password
        },
      });
      const res = createMockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const req = createMockRequest({
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123!',
        },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const password = 'Test123!';
      const hashedPassword = await hashPassword(password);

      const req = createMockRequest({
        body: {
          username: 'testuser',
          password: password,
        },
      });
      const res = createMockResponse();

      const mockUser = generateMockUser({
        username: 'testuser',
        password: hashedPassword,
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await login(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            username: 'testuser',
          }),
          token: 'mock-jwt-token',
        })
      );
    });

    it('should return 401 if user not found', async () => {
      const req = createMockRequest({
        body: {
          username: 'nonexistent',
          password: 'Test123!',
        },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid'),
        })
      );
    });

    it('should return 401 if password is incorrect', async () => {
      const hashedPassword = await hashPassword('correctpassword');

      const req = createMockRequest({
        body: {
          username: 'testuser',
          password: 'wrongpassword',
        },
      });
      const res = createMockResponse();

      const mockUser = generateMockUser({
        username: 'testuser',
        password: hashedPassword,
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid'),
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const req = createMockRequest({
        body: {
          username: 'testuser',
          // Missing password
        },
      });
      const res = createMockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = generateMockUser();

      const req = createMockRequest({
        user: mockUser,
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await getProfile(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.any(Object),
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: mockUser.id,
            username: mockUser.username,
          }),
        })
      );
    });

    it('should return 404 if user not found', async () => {
      const mockUser = generateMockUser();

      const req = createMockRequest({
        user: mockUser,
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(null);

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('not found'),
        })
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const currentPassword = 'OldPass123!';
      const newPassword = 'NewPass123!';
      const hashedOldPassword = await hashPassword(currentPassword);

      const mockUser = generateMockUser({
        password: hashedOldPassword,
      });

      const req = createMockRequest({
        user: mockUser,
        body: {
          currentPassword,
          newPassword,
        },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      await updatePassword(req, res);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it('should return 401 if current password is incorrect', async () => {
      const hashedPassword = await hashPassword('correctpassword');

      const mockUser = generateMockUser({
        password: hashedPassword,
      });

      const req = createMockRequest({
        user: mockUser,
        body: {
          currentPassword: 'wrongpassword',
          newPassword: 'NewPass123!',
        },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Current password'),
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const mockUser = generateMockUser();

      const req = createMockRequest({
        user: mockUser,
        body: {
          currentPassword: 'OldPass123!',
          // Missing newPassword
        },
      });
      const res = createMockResponse();

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

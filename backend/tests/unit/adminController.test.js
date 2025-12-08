/**
 * Admin Controller Unit Tests
 */

import { jest } from '@jest/globals';
import {
  createMockRequest,
  createMockResponse,
  createMockPrisma,
  generateMockUser,
  generateMockLevel,
  generateMockTask,
} from '../helpers/testHelpers.js';

// Mock dependencies
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: createMockPrisma(),
}));

jest.unstable_mockModule('../../src/config/socket.js', () => ({
  emitAdminNotification: jest.fn(),
}));

const { default: prisma } = await import('../../src/config/database.js');
const { emitAdminNotification } = await import('../../src/config/socket.js');
const {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  createLevel,
  updateLevel,
  deleteLevel,
  getAnalytics,
} = await import('../../src/controllers/adminController.js');

describe('Admin Controller', () => {
  let mockAdminUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminUser = generateMockUser({ role: 'ADMIN' });
  });

  describe('getAllUsers', () => {
    it('should return paginated list of users', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        query: { page: '1', limit: '10' },
      });
      const res = createMockResponse();

      const mockUsers = [
        generateMockUser(),
        generateMockUser(),
        generateMockUser(),
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(3);
      prisma.progress.aggregate.mockResolvedValue({ _sum: { score: 100 } });

      await getAllUsers(req, res);

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.user.count).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          users: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: 3,
          }),
        })
      );
    });

    it('should filter users by role', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        query: { role: 'ADMIN' },
      });
      const res = createMockResponse();

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await getAllUsers(req, res);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'ADMIN',
          }),
        })
      );
    });

    it('should search users by username or email', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        query: { search: 'john' },
      });
      const res = createMockResponse();

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await getAllUsers(req, res);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ username: expect.any(Object) }),
              expect.objectContaining({ email: expect.any(Object) }),
            ]),
          }),
        })
      );
    });
  });

  describe('getUserDetails', () => {
    it('should return detailed user information', async () => {
      const targetUser = generateMockUser();

      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: targetUser.id },
      });
      const res = createMockResponse();

      const mockUserDetails = {
        ...targetUser,
        progress: [],
        userAnswers: [],
        achievements: [],
        uploadedFiles: [],
      };

      prisma.user.findUnique.mockResolvedValue(mockUserDetails);
      prisma.progress.aggregate.mockResolvedValue({ _sum: { score: 250 } });

      await getUserDetails(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: targetUser.id },
          include: expect.any(Object),
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
        })
      );
    });

    it('should return 404 if user not found', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: 'nonexistent-id' },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(null);

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('not found'),
        })
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const targetUser = generateMockUser({ role: 'USER' });

      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: targetUser.id },
        body: { role: 'MODERATOR' },
      });
      const res = createMockResponse();

      const updatedUser = { ...targetUser, role: 'MODERATOR' };
      prisma.user.update.mockResolvedValue(updatedUser);

      await updateUserRole(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: targetUser.id },
          data: { role: 'MODERATOR' },
        })
      );
      expect(emitAdminNotification).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            role: 'MODERATOR',
          }),
        })
      );
    });

    it('should return 400 for invalid role', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: 'user-id' },
        body: { role: 'INVALID_ROLE' },
      });
      const res = createMockResponse();

      await updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid role'),
        })
      );
    });

    it('should prevent self-role-change', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: mockAdminUser.id },
        body: { role: 'USER' },
      });
      const res = createMockResponse();

      await updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('cannot change'),
        })
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const targetUser = generateMockUser();

      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: targetUser.id },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(targetUser);
      prisma.user.delete.mockResolvedValue(targetUser);

      await deleteUser(req, res);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: targetUser.id },
      });
      expect(emitAdminNotification).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('deleted'),
        })
      );
    });

    it('should prevent self-deletion', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        params: { userId: mockAdminUser.id },
      });
      const res = createMockResponse();

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Cannot delete your own account'),
        })
      );
    });

    it('should prevent non-admin from deleting admins', async () => {
      const moderatorUser = generateMockUser({ role: 'MODERATOR' });
      const targetAdmin = generateMockUser({ role: 'ADMIN' });

      const req = createMockRequest({
        user: moderatorUser,
        params: { userId: targetAdmin.id },
      });
      const res = createMockResponse();

      prisma.user.findUnique.mockResolvedValue(targetAdmin);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('createLevel', () => {
    it('should create a new level successfully', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        body: {
          title: 'New Forensics Level',
          description: 'Advanced network analysis',
          difficulty: 'ADVANCED',
          orderIndex: 6,
        },
      });
      const res = createMockResponse();

      const mockLevel = generateMockLevel(req.body);
      prisma.level.create.mockResolvedValue(mockLevel);

      await createLevel(req, res);

      expect(prisma.level.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Forensics Level',
          difficulty: 'ADVANCED',
        }),
      });
      expect(emitAdminNotification).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          level: expect.any(Object),
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
        body: {
          title: 'New Level',
          // Missing other required fields
        },
      });
      const res = createMockResponse();

      await createLevel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateLevel', () => {
    it('should update level successfully', async () => {
      const mockLevel = generateMockLevel();

      const req = createMockRequest({
        user: mockAdminUser,
        params: { levelId: mockLevel.id },
        body: {
          title: 'Updated Title',
          difficulty: 'INTERMEDIATE',
        },
      });
      const res = createMockResponse();

      const updatedLevel = { ...mockLevel, title: 'Updated Title' };
      prisma.level.update.mockResolvedValue(updatedLevel);

      await updateLevel(req, res);

      expect(prisma.level.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockLevel.id },
          data: expect.objectContaining({
            title: 'Updated Title',
          }),
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          level: expect.any(Object),
        })
      );
    });
  });

  describe('deleteLevel', () => {
    it('should delete level successfully', async () => {
      const mockLevel = generateMockLevel();

      const req = createMockRequest({
        user: mockAdminUser,
        params: { levelId: mockLevel.id },
      });
      const res = createMockResponse();

      prisma.level.delete.mockResolvedValue(mockLevel);

      await deleteLevel(req, res);

      expect(prisma.level.delete).toHaveBeenCalledWith({
        where: { id: mockLevel.id },
      });
      expect(emitAdminNotification).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('deleted'),
        })
      );
    });
  });

  describe('getAnalytics', () => {
    it('should return comprehensive analytics', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
      });
      const res = createMockResponse();

      prisma.user.count.mockResolvedValue(50);
      prisma.level.count.mockResolvedValue(5);
      prisma.task.count.mockResolvedValue(29);
      prisma.userAnswer.count
        .mockResolvedValueOnce(1000) // Total submissions
        .mockResolvedValueOnce(750); // Correct submissions
      prisma.uploadedFile.count.mockResolvedValue(150);
      prisma.user.findMany.mockResolvedValue([]);

      await getAnalytics(req, res);

      expect(prisma.user.count).toHaveBeenCalled();
      expect(prisma.level.count).toHaveBeenCalled();
      expect(prisma.task.count).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics: expect.objectContaining({
            totalUsers: 50,
            totalLevels: 5,
            totalTasks: 29,
            totalSubmissions: 1000,
            correctSubmissions: 750,
            accuracy: expect.any(String),
          }),
        })
      );
    });

    it('should handle zero submissions correctly', async () => {
      const req = createMockRequest({
        user: mockAdminUser,
      });
      const res = createMockResponse();

      prisma.user.count.mockResolvedValue(5);
      prisma.level.count.mockResolvedValue(3);
      prisma.task.count.mockResolvedValue(15);
      prisma.userAnswer.count.mockResolvedValue(0);
      prisma.uploadedFile.count.mockResolvedValue(0);
      prisma.user.findMany.mockResolvedValue([]);

      await getAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics: expect.objectContaining({
            accuracy: '0',
          }),
        })
      );
    });
  });
});

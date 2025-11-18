/**
 * Auth Routes Integration Tests
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes.js';
import { createMockPrisma, generateMockUser, hashPassword } from '../helpers/testHelpers.js';

// Mock dependencies
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: createMockPrisma(),
}));

jest.unstable_mockModule('../../src/utils/jwt.js', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  verifyToken: jest.fn(() => ({ userId: 'user-id-123', role: 'USER' })),
}));

const { default: prisma } = await import('../../src/config/database.js');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Test123!',
      };

      const mockUser = generateMockUser({
        username: newUser.username,
        email: newUser.email,
      });

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(newUser.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if username already exists', async () => {
      const newUser = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'Test123!',
      };

      prisma.user.findUnique.mockResolvedValueOnce(generateMockUser());

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/Username/i);
    });

    it('should return 400 if email already exists', async () => {
      const newUser = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Test123!',
      };

      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(generateMockUser());

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/Email/i);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          // Missing email and password
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Test123!',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials and return 200', async () => {
      const credentials = {
        username: 'testuser',
        password: 'Test123!',
      };

      const hashedPassword = await hashPassword(credentials.password);
      const mockUser = generateMockUser({
        username: credentials.username,
        password: hashedPassword,
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(credentials.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid username', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'Test123!',
      };

      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/Invalid/i);
    });

    it('should return 401 for invalid password', async () => {
      const credentials = {
        username: 'testuser',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await hashPassword('CorrectPassword123!');
      const mockUser = generateMockUser({
        username: credentials.username,
        password: hashedPassword,
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/Invalid/i);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          // Missing password
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = generateMockUser();

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/password', () => {
    it('should update password with valid credentials', async () => {
      const currentPassword = 'OldPass123!';
      const newPassword = 'NewPass123!';
      const hashedOldPassword = await hashPassword(currentPassword);

      const mockUser = generateMockUser({
        password: hashedOldPassword,
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send({
          currentPassword,
          newPassword,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should return 401 for incorrect current password', async () => {
      const hashedPassword = await hashPassword('CorrectPassword123!');
      const mockUser = generateMockUser({
        password: hashedPassword,
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPass123!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/Current password/i);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});

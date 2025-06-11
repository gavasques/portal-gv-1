import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import passport from '../server/auth/passport';
import authRoutes from '../server/auth/routes';
import { storage } from '../server/storage';
import * as bcrypt from 'bcrypt';

// Test app setup
const app = express();
app.use(express.json());
app.use(session({
  secret: 'test-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRoutes);

describe('Authentication System', () => {
  let testUser: any;
  let adminUser: any;
  let supportUser: any;

  beforeAll(async () => {
    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    testUser = await storage.createUser({
      email: 'test@example.com',
      password: hashedPassword,
      fullName: 'Test User',
      role: 'ALUNO',
      status: 'active',
      isActive: true
    });

    adminUser = await storage.createUser({
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'ADM',
      status: 'active',
      isActive: true
    });

    supportUser = await storage.createUser({
      email: 'support@example.com',
      password: hashedPassword,
      fullName: 'Support User',
      role: 'SUPORTE',
      status: 'active',
      isActive: true
    });
  });

  afterAll(async () => {
    // Clean up test users
    if (testUser) await storage.deleteUser(testUser.id);
    if (adminUser) await storage.deleteUser(adminUser.id);
    if (supportUser) await storage.deleteUser(supportUser.id);
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpass123',
          fullName: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.role).toBe('BASIC');

      // Clean up
      const user = await storage.getUserByEmail('newuser@example.com');
      if (user) await storage.deleteUser(user.id);
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com'
          // Missing password and fullName
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should reject registration with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com', // Already exists
          password: 'password123',
          fullName: 'Duplicate User'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('ALUNO');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpass123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    let userAgent: request.SuperAgentTest;
    let adminAgent: request.SuperAgentTest;
    let supportAgent: request.SuperAgentTest;

    beforeEach(async () => {
      // Create authenticated sessions for each user type
      userAgent = request.agent(app);
      adminAgent = request.agent(app);
      supportAgent = request.agent(app);

      // Login each user
      await userAgent
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'testpass123' });

      await adminAgent
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'testpass123' });

      await supportAgent
        .post('/api/auth/login')
        .send({ email: 'support@example.com', password: 'testpass123' });
    });

    it('should allow admin access to admin-only routes', async () => {
      const response = await adminAgent.get('/api/auth/admin-only');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Admin access granted');
      expect(response.body.user).toBe('ADM');
    });

    it('should deny non-admin access to admin-only routes', async () => {
      const response = await userAgent.get('/api/auth/admin-only');
      
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
      expect(response.body.requiredRoles).toContain('ADM');
    });

    it('should allow support and admin access to support routes', async () => {
      const supportResponse = await supportAgent.get('/api/auth/support-or-admin');
      const adminResponse = await adminAgent.get('/api/auth/support-or-admin');
      
      expect(supportResponse.status).toBe(200);
      expect(adminResponse.status).toBe(200);
      expect(supportResponse.body.user).toBe('SUPORTE');
      expect(adminResponse.body.user).toBe('ADM');
    });

    it('should deny basic user access to support routes', async () => {
      const response = await userAgent.get('/api/auth/support-or-admin');
      
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
      expect(response.body.requiredRoles).toEqual(['SUPORTE', 'ADM']);
    });

    it('should allow student access to student routes', async () => {
      const response = await userAgent.get('/api/auth/students-only');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Student access granted');
      expect(response.body.user).toBe('ALUNO');
    });

    it('should deny unauthenticated access to protected routes', async () => {
      const unauthenticatedAgent = request(app);
      
      const responses = await Promise.all([
        unauthenticatedAgent.get('/api/auth/admin-only'),
        unauthenticatedAgent.get('/api/auth/support-or-admin'),
        unauthenticatedAgent.get('/api/auth/students-only'),
        unauthenticatedAgent.get('/api/auth/me')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(401);
        expect(response.body.message).toContain('Not authenticated');
      });
    });
  });

  describe('User Profile Access', () => {
    let userAgent: request.SuperAgentTest;

    beforeEach(async () => {
      userAgent = request.agent(app);
      await userAgent
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'testpass123' });
    });

    it('should return user profile for authenticated user', async () => {
      const response = await userAgent.get('/api/auth/me');
      
      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.fullName).toBe('Test User');
      expect(response.body.role).toBe('ALUNO');
      expect(response.body.isActive).toBe(true);
    });

    it('should logout user successfully', async () => {
      const logoutResponse = await userAgent.post('/api/auth/logout');
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Verify user is logged out
      const profileResponse = await userAgent.get('/api/auth/me');
      expect(profileResponse.status).toBe(401);
    });
  });

  describe('Account Status Validation', () => {
    let inactiveUser: any;

    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('testpass123', 12);
      inactiveUser = await storage.createUser({
        email: 'inactive@example.com',
        password: hashedPassword,
        fullName: 'Inactive User',
        role: 'ALUNO',
        status: 'inactive',
        isActive: false
      });
    });

    afterAll(async () => {
      if (inactiveUser) await storage.deleteUser(inactiveUser.id);
    });

    it('should reject login for inactive users', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'testpass123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('desativada');
    });
  });
});
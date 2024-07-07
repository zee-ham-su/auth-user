const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const Organisation = require('../models/organisation');
const { pool } = require('../db');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Ensure a clean state before tests
    await User.destroy({ where: {} });
    await Organisation.destroy({ where: {} });
  });

  afterAll(async () => {
    // Clean up the test database after tests
    await User.destroy({ where: {} });
    await Organisation.destroy({ where: {} });
    pool.end(); // Close the database connection
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('userId');
    });

    it('should not register a user with an existing email', async () => {
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(res.status).toBe(422);
      expect(res.body.errors[0].msg).toBe('Email already exists');
    });

    it('should return validation errors for missing fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: '',
          lastName: '',
          email: 'invalidemail',
          password: '',
          phone: '',
        });

      expect(res.status).toBe(422);
      expect(res.body.errors).toHaveLength(4);
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return error for invalid email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication failed');
    });

    it('should return error for invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication failed');
    });

    it('should return validation errors for missing fields', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: '',
          password: '',
        });

      expect(res.status).toBe(422);
      expect(res.body.errors).toHaveLength(2);
    });
  });
});

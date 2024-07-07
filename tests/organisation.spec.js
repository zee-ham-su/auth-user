const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const Organisation = require('../models/organisation');
const { generateToken } = require('../auth');
describe('Organisation Endpoints', () => {
  let token; // Store the JWT token for authenticated requests
  let organisationId; // Store the ID of the created organisation for testing

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '1234567890',
    });

    // Generate a JWT token for the user
    token = generateToken(user);
  });

  afterAll(async () => {
    // Clean up the test database after tests
    await Organisation.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('GET /organisations', () => {
    it('should retrieve organisations successfully', async () => {
      const res = await request(app)
        .get('/organisations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.organisations).toBeInstanceOf(Array);
    });
  });

  describe('GET /organisations/:orgId', () => {
    beforeAll(async () => {
      // Create a test organisation
      const organisation = await Organisation.create({
        name: 'Test Organisation',
        description: 'Test description',
      });

      organisationId = organisation.id;
    });

    it('should retrieve an organisation by ID successfully', async () => {
      const res = await request(app)
        .get(`/organisations/${organisationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBe(organisationId);
    });

    it('should return 404 if organisation ID does not exist', async () => {
      const res = await request(app)
        .get('/organisations/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('Not found');
    });
  });

  describe('POST /organisations', () => {
    it('should create a new organisation successfully', async () => {
      const res = await request(app)
        .post('/organisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Organisation',
          description: 'New description',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('New Organisation');
    });

    it('should return validation errors for missing fields', async () => {
      const res = await request(app)
        .post('/organisations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'New description',
        });

      expect(res.status).toBe(422);
      expect(res.body.errors).toHaveLength(1);
      expect(res.body.errors[0].msg).toBe('Name is required');
    });
  });

  describe('POST /organisations/:orgId/users', () => {
    let anotherUser;

    beforeAll(async () => {
      // Create another user
      anotherUser = await User.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password456',
        phone: '0987654321',
      });
    });

    it('should add a user to the organisation successfully', async () => {
      const res = await request(app)
        .post(`/organisations/${organisationId}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: anotherUser.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      // You can add more assertions based on your response structure
    });

    it('should return 404 if organisation ID does not exist', async () => {
      const res = await request(app)
        .post('/organisations/999/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: anotherUser.id,
        });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('Not found');
    });

    it('should return 403 if user is not authorized to add users to the organisation', async () => {
      // Simulate another user trying to add a user to the organisation
      const unauthorizedToken = generateToken({
        id: 999, // Assuming an ID that's not associated with the organisation
      });

      const res = await request(app)
        .post(`/organisations/${organisationId}/users`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          userId: anotherUser.id,
        });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('Forbidden');
    });

    it('should return validation errors for missing fields', async () => {
      const res = await request(app)
        .post(`/organisations/${organisationId}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.errors).toHaveLength(1);
      expect(res.body.errors[0].msg).toBe('User ID is required');
    });
  });
});

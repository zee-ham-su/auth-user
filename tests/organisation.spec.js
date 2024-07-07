const request = require('supertest');
const app = require('../index');

describe('GET /organisations', () => {
  test('should return 200 and retrieve organisations successfully', async () => {
    const response = await request(app)
      .get('/organisations')
      .set('Authorization', 'Bearer your_token_here');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Organisations retrieved successfully');
    expect(response.body.data.organisations).toBeDefined();
  });

  test('should return 500 and handle internal server error', async () => {
    const response = await request(app)
      .get('/organisations')
      .set('Authorization', 'Bearer your_token_here');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('Internal server error');
    expect(response.body.message).toBe('Failed to retrieve organisations');
    expect(response.body.statusCode).toBe(500);
  });
});

describe('GET /organisations/:orgId', () => {
  test('should return 200 and retrieve organisation successfully', async () => {
    const response = await request(app)
      .get('/organisations/1')
      .set('Authorization', 'Bearer your_token_here');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Organisation retrieved successfully');
    expect(response.body.data).toBeDefined();
  });

  test('should return 404 when organisation is not found', async () => {
    const response = await request(app)
      .get('/organisations/999')
      .set('Authorization', 'Bearer your_token_here');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Not found');
    expect(response.body.message).toBe('Organisation not found');
    expect(response.body.statusCode).toBe(404);
  });

  test('should return 403 when user is not authorized to access the organisation', async () => {
    const response = await request(app)
      .get('/organisations/1')
      .set('Authorization', 'Bearer your_token_here');

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('Forbidden');
    expect(response.body.message).toBe('Unauthorized access');
    expect(response.body.statusCode).toBe(403);
  });
});

describe('POST /organisations', () => {
  test('should return 201 and create organisation successfully', async () => {
    const response = await request(app)
      .post('/organisations')
      .set('Authorization', 'Bearer your_token_here')
      .send({
        name: 'Sample Organisation',
        description: 'This is a sample organisation',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Organisation created successfully');
    expect(response.body.data).toBeDefined();
  });

  test('should return 400 when request body is invalid', async () => {
    const response = await request(app)
      .post('/organisations')
      .set('Authorization', 'Bearer your_token_here')
      .send({
        name: '',
        description: 'This is a sample organisation',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('Bad Request');
    expect(response.body.message).toBe('Client error');
    expect(response.body.statusCode).toBe(400);
  });
});

describe('POST /organisations/:orgId/users', () => {
  test('should return 200 and add user to organisation successfully', async () => {
    const response = await request(app)
      .post('/organisations/1/users')
      .set('Authorization', 'Bearer your_token_here')
      .send({
        userId: 'user_id_here',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('User added to organisation successfully');
  });

  test('should return 404 when organisation is not found', async () => {
    const response = await request(app)
      .post('/organisations/999/users')
      .set('Authorization', 'Bearer your_token_here')
      .send({
        userId: 'user_id_here',
      });

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('Not found');
    expect(response.body.message).toBe('Organisation not found');
    expect(response.body.statusCode).toBe(404);
  });

  test('should return 403 when user is not authorized to add users to the organisation', async () => {
    const response = await request(app)
      .post('/organisations/1/users')
      .set('Authorization', 'Bearer your_token_here')
      .send({
        userId: 'user_id_here',
      });

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('Forbidden');
    expect(response.body.message).toBe('Unauthorized access');
    expect(response.body.statusCode).toBe(403);
  });
});
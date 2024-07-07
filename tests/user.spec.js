const request = require('supertest');
const app = require('../index');

describe('GET /user/:id', () => {
  test('should return 404 if user is not found', async () => {
    const response = await request(app).get('/user/123');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'Not found',
      message: 'User not found',
      statusCode: 404,
    });
  });

  test('should return 403 if user is not authorized to access the user', async () => {
    const response = await request(app).get('/user/456');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'Forbidden',
      message: 'Unauthorized access',
      statusCode: 403,
    });
  });

  test('should return 200 with user data if user is found and authorized', async () => {
    const response = await request(app).get('/user/789');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'User retrieved successfully',
      data: {
        userId: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
        phone: expect.any(String),
      },
    });
  });

  test('should return 500 if an error occurs while retrieving user', async () => {
    const response = await request(app).get('/user/999');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'Internal server error',
      message: 'Failed to retrieve user',
      statusCode: 500,
    });
  });
});
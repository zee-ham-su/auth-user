const request = require('supertest');
const app = require('../index');

describe('POST /auth/register', () => {
  test('should return 422 with invalid email format', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 12345, // Invalid email format
        password: 'password123',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          param: 'email',
          msg: 'Invalid email format',
        }),
      ])
    );
  });

  test('should return 422 with missing email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          param: 'email',
          msg: 'Invalid email format',
        }),
      ])
    );
  });

  test('should return 422 with empty email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        password: 'password123',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          param: 'email',
          msg: 'Invalid email format',
        }),
      ])
    );
  });

  test('should return 422 with null email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: null,
        password: 'password123',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          param: 'email',
          msg: 'Invalid email format',
        }),
      ])
    );
  });

  test('should return 422 with undefined email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          param: 'email',
          msg: 'Invalid email format',
        }),
      ])
    );
  });
});
const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const Organisation = require('../models/organisation');
const { generateToken } = require('../auth');

describe('GET /:id', () => {
  let user, organisation, token;

  beforeAll(async () => {
    // Create a user and organisation in the test database
    user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    });

    organisation = await Organisation.create({
      name: 'Test Org',
    });

    // Associate user with the organisation
    await user.addOrganisation(organisation);

    // Generate a token for the user
    token = generateToken({ userId: user.userId });
  });

  afterAll(async () => {
    // Clean up the test database
    await User.destroy({ where: {} });
    await Organisation.destroy({ where: {} });
  });

  it('should retrieve the user successfully', async () => {
    const res = await request(app)
      .get(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('userId', user.userId);
  });

  it('should return 404 if the user does not exist', async () => {
    const res = await request(app)
      .get('/users/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('Not found');
  });

  it('should return 403 for unauthorized access', async () => {
    const otherUser = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0987654321',
    });

    const otherToken = generateToken({ userId: otherUser.userId });

    const res = await request(app)
      .get(`/users/${user.userId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('Forbidden');
  });
});

process.env.NODE_ENV = 'test';
// npm packages
const request = require('supertest');

// app imports
const app = require('../../app');

const {
  TEST_DATA,
  afterEachHook,
  beforeEachHook,
  afterAllHook,
} = require('./config');

beforeEach(async function () {
  await beforeEachHook(TEST_DATA);
});

// Getting all users
describe('GET /users', async function () {
  test(' Responds with 200 and gets a list of 1 user', async function () {
    let token = { _token: `${TEST_DATA.userToken}` };
    const response = await request(app).get('/users').send(token);
    expect(response.statusCode).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0]).toHaveProperty('username');
    expect(response.body.users[0]).not.toHaveProperty('password');
  });
});

// Getting one user
describe('GET /users/:username', async function () {
  test('Responds with 200 and gets a single user', async function () {
    const response = await request(app)
      .get(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('username');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user.username).toBe('test');
  });

  test('Responds with a 404 if user cannot be found', async function () {
    const response = await request(app)
      .get(`/users/sdfgsdfs`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(404);
  });
});

// Updates a user
describe('PATCH /users/:username', async () => {
  test('Responds 200 and updates a user first name', async function () {
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({
        _token: `${TEST_DATA.userToken}`,
        first_name: 'killua',
        password: `${TEST_DATA.password}`,
      });

    const user = response.body.user;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username');
    expect(user).not.toHaveProperty('password');
    expect(user.first_name).toBe('killua');
    expect(user.username).not.toBe(null);
  });

  test("Responds with 200 and updates  user's password", async function () {
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}`, password: 'gonFreecs' });

    const user = response.body.user;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username');
    expect(user).not.toHaveProperty('password');
  });

  test('Responds with 400 and prevents a user from being created ', async function () {
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({ cactus: false, _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(400);
  });

  test("Responds with 400 if no password and doesn't update users first_namme", async function () {
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}`, first_name: 'gonFreecs' });

    const user = response.body.user;
    expect(response.statusCode).toBe(400);
  });

  test('Responds with 401 abd forbids a user from editing another user', async function () {
    const response = await request(app)
      .patch(`/users/not-auth`)
      .send({ password: 'gonFreecs', _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(401);
  });

  test('Responds with a 404 if it cannot find the user in question', async function () {
    // delete user first
    await request(app)
      .delete(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    const response = await request(app)
      .patch(`/users/${TEST_DATA.currentUsername}`)
      .send({ password: 'foo12345', _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(404);
  });
});

// Deletes a user
describe('DELETE /users/:username', async function () {
  test('Responds with 200 and deletes a single a user', async function () {
    const response = await request(app)
      .delete(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'User deleted' });
  });

  test('Responds with 401 and forbids a user from deleting another user', async function () {
    const response = await request(app)
      .delete(`/users/notme`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(401);
  });

  test('Responds with a 404 if it cannot find the user', async function () {
    // delete user first
    await request(app)
      .delete(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    const response = await request(app)
      .delete(`/users/${TEST_DATA.currentUsername}`)
      .send({ _token: `${TEST_DATA.userToken}` });
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});

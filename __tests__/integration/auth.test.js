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

//Testing Creating a new user
describe('POST /users', async function () {
  test('Creates new user', async function () {
    let data = {
      username: 'GodsSpeed',
      first_name: 'Kiilua',
      password: 'gonfreecs',
      last_name: 'Zoldyck',
      email: 'killua@zoldyck.com',
    };
    const response = await request(app).post('/users').send(data);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  test('Prevents creating a user with duplicate username', async function () {
    let data = {
      username: 'test',
      first_name: 'Kiilua',
      password: 'gonfreecs',
      last_name: 'Zoldyck',
      email: 'killua@zoldyck.com',
    };
    const response = await request(app).post('/users').send(data);
    expect(response.statusCode).toBe(400);
  });

  test('Prevents creating a user without required password field', async function () {
    let data = {
      username: 'GodsSpeed',
      first_name: 'Kiilua',
      last_name: 'Zoldyck',
      email: 'killua@zoldyck.com',
    };
    const response = await request(app).post('/users').send(data);
    expect(response.statusCode).toBe(400);
  });

  test('Prevents creating a user with password too short', async function () {
    let data = {
      username: 'GodsSpeed',
      password: 'gon',
      first_name: 'Kiilua',
      last_name: 'Zoldyck',
      email: 'killua@zoldyck.com',
    };
    const response = await request(app).post('/users').send(data);
    expect(response.statusCode).toBe(400);
  });

  test('Prevents creating a user with not an email format', async function () {
    let data = {
      username: 'GodsSpeed',
      password: 'gon',
      first_name: 'Kiilua',
      last_name: 'Zoldyck',
      email: 'killua.com',
    };
    const response = await request(app).post('/users').send(data);
    expect(response.statusCode).toBe(400);
  });
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});

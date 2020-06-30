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

describe('POST /jobs', function () {
  test('Creates a new job', async function () {
    const response = await request(app).post('/jobs').send({
      _token: TEST_DATA.userToken,
      company_handle: TEST_DATA.currentCompany.handle,
      title: 'Test Tennis Coach',
      salary: 1000000,
      equity: 0.1,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.job).toHaveProperty('id');
  });

  // Bug 1
  test('Prevents creating a job without a title', async function () {
    const response = await request(app).post('/jobs').send({
      _token: TEST_DATA.userToken,
      salary: 1000000,
      equity: 0.2,
      company_handle: TEST_DATA.currentCompany.handle,
    });
    expect(response.statusCode).toBe(400);
  });

  // Bug 2
  test('Prevents creating a job without company handle', async function () {
    const response = await request(app).post('/jobs').send({
      _token: TEST_DATA.userToken,
      salary: 1000000,
      title: 'test bug 2',
      equity: 0.2,
    });
    expect(response.statusCode).toBe(400);
  });
});

//Testing GET jobs

describe('GET /jobs', async function () {
  test('Gets a list of Jobs', async function () {
    const response = await request(app).get(`/jobs`).send({
      _token: TEST_DATA.userToken,
    });
    const jobs = response.body.jobs;
    expect(response.statusCode).toBe(200);
    expect(jobs[0]).toHaveProperty('company_handle');
    expect(jobs[0]).toHaveProperty('title');
  });

  // Adding three jobs to test search
  test('Search params are working', async function () {
    await request(app).post(`/jobs`).send({
      title: 'Tennis coach',
      salary: 1000000,
      equity: 0.2,
      company_handle: TEST_DATA.currentCompany.handle,
      _token: TEST_DATA.userToken,
    });

    await request(app).post(`/jobs`).send({
      title: 'test engineer',
      salary: 1000000,
      company_handle: TEST_DATA.currentCompany.handle,
      _token: TEST_DATA.userToken,
    });

    await request(app).post(`/jobs`).send({
      title: 'Dog Walker',
      salary: 150000,
      company_handle: TEST_DATA.currentCompany.handle,
      _token: TEST_DATA.userToken,
    });

    const response = await request(app)
      .get('/jobs?search=tennis+coach')
      .send({ _token: TEST_DATA.userToken });
    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0]).toHaveProperty('company_handle');
    expect(response.body.jobs[0]).toHaveProperty('title');
  });

  // Testing 'no results search'
  test('Search params show no results', async function () {
    await request(app).post(`/jobs`).send({
      title: 'Tennis coach',
      salary: 1000000,
      equity: 0.2,
      company_handle: TEST_DATA.currentCompany.handle,
      _token: TEST_DATA.userToken,
    });

    await request(app).post(`/jobs`).send({
      title: 'test engineer',
      salary: 1000000,
      company_handle: TEST_DATA.currentCompany.handle,
      _token: TEST_DATA.userToken,
    });

    await request(app).post(`/jobs`).send({
      title: 'Dog Walker',
      salary: 150000,
      company_handle: TEST_DATA.currentCompany.handle,
      _token: TEST_DATA.userToken,
    });

    const response = await request(app)
      .get('/jobs?search=sdfascvsadsc+dcascas')
      .send({ _token: TEST_DATA.userToken });
    expect(response.body.jobs).toHaveLength(0);
  });

  // Getting a specific job by id
  describe('GET /jobs/:id', async function () {
    test('Responds with 200 and get one job', async function () {
      const response = await request(app)
        .get(`/jobs/${TEST_DATA.jobId}`)
        .send({ _token: TEST_DATA.userToken });
      expect(response.statusCode).toBe(200);
      expect(response.body.job).toHaveProperty('id');
      expect(response.body.job.id).toBe(TEST_DATA.jobId);
    });

    test('Responds with a 404 if it cannot find the job', async function () {
      const response = await request(app)
        .get(`/jobs/999`)
        .send({ _token: TEST_DATA.userToken });
      expect(response.statusCode).toBe(404);
    });
  });
});

//EDIT a job

describe('PATCH /jobs/:id', async function () {
  test('Updates title of a single job', async function () {
    const response = await request(app)
      .patch(`/jobs/${TEST_DATA.jobId}`)
      .send({ title: 'Updated Title', _token: TEST_DATA.userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.job).toHaveProperty('id');
    expect(response.body.job.title).toBe('Updated Title');
    expect(response.body.job.id).not.toBe(null);
  });

  test('Updates salary of single job', async function () {
    const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
      _token: TEST_DATA.userToken,
      salary: 50000,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.job).toHaveProperty('id');
  });

  test('Updates equity of single job', async function () {
    const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
      _token: TEST_DATA.userToken,
      equity: 0.7,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.job).toHaveProperty('id');
  });
  test('Prevents a bad job update', async function () {
    const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
      _token: TEST_DATA.userToken,
      cactus: false,
    });
    expect(response.statusCode).toBe(500);
  });

  test('Responds with a 404 if it cannot find the job in question', async function () {
    // delete job first
    await request(app).delete(`/jobs/${TEST_DATA.jobId}`).send({
      _token: TEST_DATA.userToken,
      title: 'instructor',
    });
    const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
      _token: TEST_DATA.userToken,
      title: 'instructor',
    });
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /jobs/:id', async function () {
  test('Deletes a single a job', async function () {
    const response = await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.userToken });
    expect(response.body).toEqual({ message: 'Job deleted' });
  });

  test('Responds with a 404 if it cannot find the job in question', async function () {
    // delete job first
    await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.userToken });
    const response = await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.userToken });
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});

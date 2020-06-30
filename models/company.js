const db = require('../db');
const ExpressError = require('../helpers/ExpressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

// Smart OO Model for company

class Company {
  // Find all companies
  constructor(handle, name, description, logo_url, num_employees, jobs) {
    // ^^ this has to be in order??
    this.handle = handle;
    this.name = name;
    this.description = description;
    this.logo_url = logo_url;
    this.num_employees = num_employees;
    this.jobs = jobs;
  }
  static async getAll(data) {
    let baseQuery = `SELECT handle, name, description, logo_url FROM companies`;
    let searchWhere = [];
    let searchValues = [];

    if (+data.min_employees >= +data.max_employees) {
      throw new Error('Min employees must be less than max employees');
    }

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (data.min_employees) {
      searchValues.push(+data.min_employees);
      searchWhere.push(`num_employees >= $${searchValues.length}`);
    }

    if (data.max_employees) {
      searchValues.push(+data.max_employees);
      searchWhere.push(`num_employees <= $${searchValues.length}`);
    }

    if (data.search) {
      searchValues.push(`%${data.search}%`);
      searchWhere.push(`name ILIKE $${searchValues.length}`);
    }

    if (searchWhere.length > 0) {
      baseQuery += ' WHERE ';
    }
    let finalQuery = baseQuery + searchWhere.join(' AND ') + ' ORDER BY name';

    const results = await db.query(finalQuery, searchValues);

    const companies = results.rows.map(
      (c) => new Company(c.handle, c.name, c.description, c.logo_url)
    );

    return companies;
  }

  // ^^ This was copied form the solution, found it hard trying to handle query string parameters

  //  get one company by handle

  static async getByHandle(handle) {
    const results = await db.query(
      `SELECT handle, name,description,logo_url, num_employees
            FROM companies
            WHERE handle = $1`,
      [handle]
    );

    const c = results.rows[0];

    if (!c) {
      throw new ExpressError(`Sorry, but '${handle}' doesn't exist`, 404);
    }

    const jobsResults = await db.query(
      `SELECT id, title, salary, equity
            FROM jobs 
            WHERE company_handle = $1`,
      [handle]
    );

    c.jobs = jobsResults.rows;

    return new Company(
      c.handle,
      c.name,
      c.description,
      c.logo_url,
      c.num_employees,
      c.jobs
    );
  }

  // Create a company post function

  static async create(handle, name, description, logo_url, num_employees) {
    const handleExists = await db.query(
      `SELECT handle
            FROM companies
            WHERE handle = $1`,
      [handle]
    );

    if (handleExists.rows[0]) {
      throw new ExpressError(
        `There already exists a company with handle '${handle}`,
        400
      );
    }

    const result = await db.query(
      `INSERT INTO companies 
              (handle, name, description, logo_url, num_employees)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING handle, name, description, logo_url, num_employees`,
      [handle, name, description, logo_url, num_employees]
    );
    var { handle, name, description, logo_url, num_employees } = result.rows[0];

    return new Company(handle, name, description, logo_url, num_employees);
  }

  // Patch/save function

  async save(handle, data) {
    let { query, values } = sqlForPartialUpdate(
      'companies',
      data,
      'handle',
      handle
    );

    await db.query(query, values);
  }

  // Smart OOP way to remove

  async remove() {
    await db.query(
      `DELETE FROM companies 
          WHERE handle = $1 
          RETURNING handle`,
      [this.handle]
    );
  }
}

module.exports = Company;

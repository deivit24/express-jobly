const db = require('../db');
const ExpressError = require('../helpers/ExpressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

//Smart OOP MODEL

class Job {
  constructor(id, title, company_handle, salary, equity, date_posted, company) {
    this.id = id;
    this.title = title;
    this.company_handle = company_handle;
    this.salary = salary;
    this.equity = equity;
    this.date_posted = date_posted;
    this.company = company;
  }

  static async findAll(data) {
    let baseQuery =
      'SELECT id, title, company_handle, salary, equity, date_posted FROM jobs';
    let searchWhere = [];
    let searchValues = [];

    if (data.min_salary) {
      searchValues.push(+data.min_salary);
      searchWhere.push(`salary >= $${searchValues.length}`);
    }

    if (data.min_equity) {
      searchValues.push(+data.min_equity);
      searchWhere.push(`equity >= $${searchValues.length}`);
    }

    if (data.search) {
      searchValues.push(`%${data.search}%`);
      searchWhere.push(`title ILIKE $${searchValues.length}`);
    }

    if (searchWhere.length > 0) {
      baseQuery += ' WHERE ';
    }

    // Finalize query and return results

    let finalQuery = baseQuery + searchWhere.join(' AND ');
    const results = await db.query(finalQuery, searchValues);
    const jobs = results.rows.map(
      (j) =>
        new Job(
          j.id,
          j.title,
          j.company_handle,
          j.salary,
          j.equity,
          j.date_posted
        )
    );
    return jobs;
  }

  //Find by ID

  static async getById(id) {
    const results = await db.query(
      `SELECT id, title, company_handle, salary, equity, date_posted 
        FROM jobs 
        WHERE id = $1`,
      [id]
    );

    const j = results.rows[0];

    if (!j) {
      throw new ExpressError(
        `Sorry, but there is no job with the id of '${id}'`,
        404
      );
    }

    const companiesRes = await db.query(
      `SELECT name, num_employees, description, logo_url 
        FROM companies 
        WHERE handle = $1`,
      [j.company_handle]
    );

    j.company = companiesRes.rows[0];

    return new Job(
      j.id,
      j.title,
      j.company_handle,
      j.salary,
      j.equity,
      j.date_posted,
      j.company
    );
  }

  // Create new job

  static async create(data) {
    //^^ I have to use data here because when I try to deconstruct the results below, it says taht I already initilized the variables.... That is why it is different from companies create post
    const result = await db.query(
      `INSERT INTO jobs (title, company_handle, salary, equity) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, title, company_handle, salary, equity`,
      [data.title, data.company_handle, data.salary, data.equity]
    );
    let { id, title, company_handle, salary, equity } = result.rows[0];
    return new Job(id, title, company_handle, salary, equity);
  }

  async save(id, data) {
    let { query, values } = sqlForPartialUpdate('jobs', data, 'id', id);

    await db.query(query, values);
  }
  //^^ copied from solution I did not know how to update via smart OOP way

  // Smart OOP way to remove

  async remove() {
    const result = await db.query(
      `DELETE FROM jobs 
        WHERE id = $1 
        RETURNING id`,
      [this.id]
    );
  }
}

module.exports = Job;

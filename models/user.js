const db = require('../db');
const bcrypt = require('bcrypt');
const partialUpdate = require('../helpers/partialUpdate');
const ExpressError = require('../helpers/ExpressError');

const BCRYPT_WORK_FACTOR = 10;

//Smart OOP for users

class User {
  constructor(
    username,
    first_name,
    last_name,
    email,
    photo_url,
    password,
    is_admin
  ) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin;
    this.password = password;
  }

  // This authenticates a user by comparing hashed entered password to the hashed password in the database

  static async authenticate(data) {
    // try to find the user first
    const result = await db.query(
      `SELECT username, 
              password, 
              first_name, 
              last_name, 
              email, 
              photo_url, 
              is_admin
        FROM users 
        WHERE username = $1`,
      [data.username]
    );

    const u = result.rows[0];

    if (u) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(data.password, u.password);

      if (isValid) {
        return new User(
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          u.photo_url,
          u.is_admin,
          u.password
        );
      }
    }

    throw new ExpressError('Invalid Password', 401);
  }

  // Registers User with the data entered and returns the user

  static async register(data) {
    const duplicateCheck = await db.query(
      `SELECT username 
        FROM users 
        WHERE username = $1`,
      [data.username]
    );

    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a user with username '${data.username}`,
        400
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users 
          (username, password, first_name, last_name, email, photo_url) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING username, password, first_name, last_name, email, photo_url`,
      [
        data.username,
        hashedPassword,
        data.first_name,
        data.last_name,
        data.email,
        data.photo_url,
      ]
    );
    const u = result.rows[0];
    return new User(
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.photo_url,
      u.is_admin,
      u.password
    );
  }

  // Get all Users

  static async getAll() {
    const results = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
        FROM users
        ORDER BY username`
    );

    const users = results.rows.map(
      (u) =>
        new User(u.username, u.first_name, u.last_name, u.email, u.photo_url)
    );
    return users;
  }

  //Get user by username

  static async getByUsername(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, email, photo_url 
        FROM users 
        WHERE username = $1`,
      [username]
    );

    const u = results.rows[0];

    if (!u) {
      throw new ExpressError(`There exists no user '${username}'`, 404);
    }

    return new User(
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.photo_url,
      u.is_admin,
      u.password
    );
  }

  // Used Smart oop to save

  async save(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    let { query, values } = partialUpdate('users', data, 'username', username);

    await db.query(query, values);
  }

  // Smart OOP way to remove

  async remove() {
    await db.query(
      `DELETE FROM users 
        WHERE username = $1
        RETURNING username`,
      [this.username]
    );
  }
}

module.exports = User;

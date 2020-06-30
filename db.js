/** Database setup for jobly. */

const { Client } = require('pg');
const { DB_URI } = require('./config');

const db = new Client({
  connectionString: DB_URI,
});

db.connect()
  .then(() => console.log(`DB Connected ${DB_URI}`))
  .catch(() => console.log('NOT CONNECTED'));

module.exports = db;

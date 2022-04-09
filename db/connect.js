//initialize before connect if not exists
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
	user: 'subgroups',
	host: 'localhost',
	database: 'subgroups',
	password: process.env.DATABASEPASSWORD,
	port: 5432,
	ssl:false
  })

//open production
try {
const data = fs.readFileSync('db/init/tables.sql', 'utf8')

pool.query(data)
} catch (err) {
console.error(err)
}

module.exports = {
	pool: pool
};

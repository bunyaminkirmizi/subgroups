//initialize before connect if not exists
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
	user: "subgroups",
	host: "localhost",
	database: "subgroups",
	password: process.env.DATABASEPASSWORD,
	port: 5432,
	ssl: false,
});

// open production
// try {
// const data = fs.readFileSync('db/init/tables.sql', 'utf8')

// pool.query(data)
// } catch (err) {
// console.error(err)
// }

async function run_query_select_rows(query, values) {
	try {
		// console.log(`sql err:\nquery: ${query}\nvalues:${values}\n`);

		const rows = (await pool.query(query, values)).rows;
		// console.log("rows:", rows);
		return rows;
	} catch (err) {
		console.error(`sql err:\nquery: ${query}\nvalues${values}`);
		console.log(err.stack);
		return null;
	}
}

async function run_query_select_first_row(query, values) {
	try {
		return (await pool.query(query, values)).rows[0];
	} catch (err) {
		console.error(`sql err:\nquery: ${query}\nvalues${values}`);
		console.log(err.stack);
		return null;
	}
}

async function run_query_no_rows(sqltext, values) {
	pool.query(sqltext, values, (err) => console.log(err));
}

module.exports = {
	pool: pool,
	run_query_select_rows: run_query_select_rows,
	run_query_select_first_row: run_query_select_first_row,
	run_query_no_rows: run_query_no_rows,
};

const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  database: "unihub",
  password: "ultrasecurepassword",
  dateStrings: true,
  connectionLimit: 5,
});

module.exports = Object.freeze({
  pool: pool,
});

db = require("./connection");

function add(id, session_reg_date, text) {
  db.pool.query(
    "INSERT INTO sessions (id, session_reg_date, data) VALUES (?, ?, ?);",
    [id, session_reg_date, text]
  );
}

async function get(id) {
  return await db.pool.query("SELECT * from sessions where id = (?);", id);
}

async function del(id) {
  return await db.pool.query("DELETE FROM sessions id = (?);", id);
}

module.exports = { add, get, del };

db = require("./connection");

function user(username, email, hashedpassword, date) {
  return {
    username: username,
    email: email,
    hashedpassword: hashedpassword,
    date: date,
  };
}

async function add(username, email, hashedpassword, date) {
  return await db.pool.query(
    "INSERT INTO user (username, email, hashed_password) VALUES (?, ?, ?);",
    [username, email, hashedpassword]
  );
}

async function get_by_username(username) {
  return await db.pool.query(
    "SELECT * from user where username = ?;",
    username
  );
}
async function getall() {
  return await db.pool.query("SELECT * from user;");
}
async function get_by_id(id) {
  return await db.pool.query("SELECT * from user where id = (?);", id);
}

async function user_del(id) {
  return await db.pool.query("DELETE FROM user id = (?);", id);
}

module.exports = { add, user_del, getall, get_by_username, get_by_id };

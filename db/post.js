const db = require("./connection");
const votes = require("./votes");
const user = require("./user");

function add(post_owner, group_owner, header, body) {
  return db.pool.query(
    "INSERT INTO post (post_owner, group_owner, header, body) VALUES (?, ?, ?, ?);",
    [post_owner, group_owner, header, body]
  );
}

async function get(id) {
  return await db.pool.query("SELECT * from post where id = ?;", id);
}

async function get_by_user_id(user_id) {
  return await db.pool.query(
    "SELECT * from post where post_owner = ?;",
    user_id
  );
}

async function get_by_group_id(group_id) {
  let posts = await db.pool.query(
    "SELECT * from post where group_owner = ? order by create_timestamp desc;",
    group_id
  );
  delete posts.meta;
  return await posts;
}

async function all() {
  return await db.pool.query("SELECT * from post;");
}

async function del(id) {
  return await db.pool.query("DELETE from post where id = ?;", id);
}
async function upt(header, body, id) {
  console.log(header, body, id);
  return await db.pool.query("UPDATE post SET header=?,body=? WHERE id=?;", [
    header,
    body,
    id,
  ]);
}
async function upvote(user_id, post_id) {
  votes.upvote(user_id, post_id);
}

async function downvote(user_id, post_id) {
  votes.downvote(user_id, post_id);
}

module.exports = {
  add,
  get,
  all,
  del,
  upt,
  get_by_group_id,
  upvote,
  downvote,
};

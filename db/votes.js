db = require("./connection");

async function del(user_id, post_id) {
  return await db.pool.query(
    "DELETE FROM votes WHERE user_id = ? AND post_id = ?;",
    [user_id, post_id]
  );
}

async function upvote(user_id, post_id) {
  await del(user_id, post_id);
  return await db.pool.query(
    "INSERT INTO votes (user_id, post_id, vote) VALUES(?, ?,  ?);",
    [user_id, post_id, 1]
  );
}

async function downvote(user_id, post_id) {
  await del(user_id, post_id);
  return await db.pool.query(
    "INSERT INTO votes (user_id, post_id, vote) VALUES(?, ?, ?);",
    [user_id, post_id, -1]
  );
}

async function votecount(post_id) {
  console.log("votecount postid", post_id);
  return await db.pool.query(
    "SELECT SUM(vote) as sumvote from votes where post_id =?;",
    [post_id]
  );
}

module.exports = {
  upvote,
  downvote,
  votecount,
};

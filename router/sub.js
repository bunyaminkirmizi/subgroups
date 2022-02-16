const express = require("express");
const auth = require("../auth");
const db_user = require("../db/user");
const db_group = require("../db/group");
const db_post = require("../db/post");
const db_votes = require("../db/votes");
const session = require("express-session");

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

router.param("subname", function (req, res, next, subname) {
  req.subname = subname;
  next();
});

router.get("/:subname", async (req, res) => {
  const dropdownmenu = await db_group.get_group_dropdown_by_name(req.subname);
  const group = await db_group.get_by_name(req.subname);
  let posts = await db_post.get_by_group_id(group.id);

  await Promise.all(
    posts.map(async (post) => {
      post.author = (await db_user.get_by_id(post.post_owner))[0].username;
    })
  );

  await Promise.all(
    posts.map(async (post) => {
      post.votes = (await db_votes.votecount(post.id))[0].sumvote;
      console.log("post.votes", post.votes);
      if (post.votes == null) {
        post.votes = 0;
      }
    })
  );

  session.lastsubclicked = req.subname;

  const options = {
    is_authenticated: auth.is_authenticated(req),
    groupdropdown: dropdownmenu,
    title: group.name,
    posts: posts,
  };
  res.render("page/sub/home.pug", options);
});

module.exports = router;

const express = require("express");
const session = require("express-session");

const auth = require("../auth");
const db_post = require("../db/post");
const db_user = require("../db/user");
const db_group = require("../db/group");
const db_votes = require("../db/votes");

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

router.param("postid", function (req, res, next, postid) {
  req.postid = postid;
  next();
});

async function ownership_required(req, res, next) {
  const user = req.session.user_id;
  const postid = req.postid;
  const post = (await db_post.get(postid))[0];
  console.log(post);
  if (post) {
    if (post.post_owner == user.id) {
      req.post = post;
      next();
      return;
    }
    console.log("ownership req failed", post.post_owner, "=!", user.id);
  }
  console.log("ownership req failed there is no such post to update");
  res.redirect("/post/" + postid);
}

router.get("/all", async (req, res) => {
  let posts = await db_post.all();
  delete posts.meta;

  const options = {
    title: "all-posts",
    is_authenticated: true,
    posts: posts,
  };

  res.render("page/post/all.pug", options);
});

router.get("/new", auth.authentication_required, (req, res) => {
  const options = {
    title: "new-post",
    is_authenticated: true,
    sub: session.lastsubclicked,
  };
  res.render("page/post/new.pug", options);
});
router.post("/new", auth.authentication_required, async (req, res) => {
  console.log(
    req.session.user_id.id,
    1,
    req.body.postheader,
    req.body.postbody
  );
  const group = await db_group.get_by_name(session.lastsubclicked);
  const result = await db_post.add(
    req.session.user_id.id,
    group.id,
    req.body.postheader,
    req.body.postbody
  );
  res.redirect("/post/" + result.insertId);
});

router.get("/:postid", async (req, res) => {
  let post = (await db_post.get(req.postid))[0];
  const author_id = post.post_owner;
  const author = (await db_user.get_by_id(author_id))[0].username;
  post.author = author;

  post.votes = (await db_votes.votecount(post.id))[0].sumvote;
  if (post.votes == null) {
    post.votes = 0;
  }

  console.log("get postid vote", post.vote);

  if (post) {
    if (post.length === 0) {
      const options = {
        title: "not found",
        is_authenticated: auth.is_authenticated(req),
        data: "there is no such post",
      };
      res.render("page/post/detail.pug", options);
      return;
    }

    const options = {
      title: req.postid,
      post: post,
      is_authenticated: auth.is_authenticated(req),
    };
    res.render("page/post/detail.pug", options);
    return;
  }
});

router.get(
  "/:postid/update",
  auth.authentication_required,
  ownership_required,
  (req, res) => {
    const options = {
      title: req.postid + " update",
      is_authenticated: true,
    };
    res.render("page/post/update.pug", options);
  }
);

router.post(
  "/:postid/update",
  auth.authentication_required,
  ownership_required,
  async (req, res) => {
    await db_post.upt(req.body.postheader, req.body.postbody, req.postid);
    res.redirect("/post/" + req.postid);
  }
);

router.get(
  "/:postid/delete",
  auth.authentication_required,
  ownership_required,
  async (req, res) => {
    const options = {
      title: req.postid + " delete",
      post: req.post,
      is_authenticated: true,
    };

    res.render("page/post/delete.pug", options);
  }
);

router.post(
  "/:postid/delete",
  auth.authentication_required,
  ownership_required,
  async (req, res) => {
    db_post.del(req.post.id);
    console.log(req.post.id + " deleted");
    res.redirect("/");
  }
);

router.get("/:postid/up", auth.authentication_required, async (req, res) => {
  const user = req.session.user_id;
  db_votes.upvote(user.id, req.postid);
  console.log(req.postid + " upvoted");
  console.log(user.id, req.postid);
  res.redirect(`/post/${req.postid}`);
});

router.get("/:postid/down", auth.authentication_required, async (req, res) => {
  const user = req.session.user_id;
  db_votes.downvote(user.id, req.postid);
  console.log(req.postid + " downvoted");
  res.redirect(`/post/${req.postid}`);
});

module.exports = router;

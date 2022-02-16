const express = require("express");
const auth = require("../auth");
const router = express.Router();
router.use(express.urlencoded({ extended: true }));

const db_user = require("../db/user");

router.get("/profile", auth.authentication_required, (req, res) => {
  const user = req.session.user_id;
  let options = {
    title: user.username,
    is_authenticated: user.authenticated,
    user: user,
  };
  res.render("page/user/profile.pug", options);
});

router.get("/all", async (req, res) => {
  console.log("user all router");
  res.send(await db_user.getall());
});

module.exports = router;

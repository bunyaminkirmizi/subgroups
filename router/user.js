const express = require("express");
const session = require("express-session");

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

router.param("postid", function (req, res, next, postid) {
  req.postid = postid;
  next();
});

module.exports = router;
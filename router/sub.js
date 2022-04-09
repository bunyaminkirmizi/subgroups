const express = require("express");
const session = require("express-session");

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

module.exports = router;
const express = require("express");
const multer = require("multer");
const auth = require("../db/auth");
const comments = require("../db/comments");
const posts = require("../db/posts");
const users = require("../db/users");
const messages = require("../db/messages");
const router = express.Router();

const user_pp_upload = multer({
	dest: "./public/profile_photos/",
	limits: { fileSize: 1000000 * 90 },
});
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
	const search_string = req.query.searchstring;
	// console.log(search_string);
	// res.send(search_string);
	const search = {
		word: search_string,
	};
	res.render("pages/search", {
		title: "arama | " + search.word,
		user: req.session.user,
		is_authenticated: auth.is_authanticated(req.session),
		search: search,
	});
});

module.exports = router;

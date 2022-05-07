const express = require("express");
const multer = require("multer");
const { is_exist } = require("../db/auth");
const auth = require("../db/auth");
const comments = require("../db/comments");
const posts = require("../db/posts");
const users = require("../db/users");
const router = express.Router();

const user_pp_upload = multer({
	dest: "./public/profile_photos/",
	limits: { fileSize: 1000000 * 90 },
});
router.use(express.urlencoded({ extended: true }));

router.post(
	"/profile/changeabout/",
	auth.authentication_required,
	async (req, res) => {
		const profileabouttext = req.body.abouttext;
		const user_id = req.session.user.user_id;
		users.add_about_text(user_id, profileabouttext);
		res.redirect("/user/profile/");
	}
);

router.post(
	"/changepp/:user_id",
	user_pp_upload.single("userpp"),
	async (req, res) => {
		//TODO: user ownership check
		const user_id = req.session.user.user_id;
		let filepath = null;
		if (req.file) {
			const pp_path = req.file.filename;
			await users.add_profile_photo(user_id, pp_path);
			//update session for profile photo
			req.session.user = await users.get_user_by_id(user_id);
		} else {
			console.log("req.file didn't worked");
		}
		res.redirect("/user/profile/");
	}
);

router.get("/profile", auth.authentication_required, async (req, res) => {
	const user_id = req.session.user.user_id;
	console.log(req.session.user);
	res.render("pages/profile", {
		title: "subgroups",
		user: req.session.user,
		profile_user: await users.get_user_by_id(user_id),
		is_authenticated: auth.is_authanticated(req.session),
		last_posts: await posts.last_posts_by_user(user_id, 5),
		last_comments: await comments.last_comments_by_user(user_id, 5),
		user_post_count: await posts.user_post_count(user_id),
		user_comment_count: await comments.user_comment_count(user_id),
	});
});

router.get("/id/:user_id", auth.authentication_required, async (req, res) => {
	const user_id = req.params.user_id;
	const is_authanticated = auth.is_authanticated(req.session);
	let profile_user = null;
	if (auth.is_exist(user_id)) {
		profile_user = await users.get_user_by_id(user_id);
	} else {
		res.redirect("/404/");
		return;
	}
	if (profile_user == null || profile_user == undefined) {
		res.redirect("/404/");
		return;
	}
	if (is_authanticated) {
		if (req.session.user.user_id == profile_user.user_id) {
			//user tries to see his own user page so redirect it to profile page
			res.redirect("/user/profile/");
			return;
		}
	}
	//TODO: check user_id is is valid
	res.render("pages/otheruser", {
		title: "subgroups",
		user: req.session.user,
		profile_user: profile_user,
		is_authenticated: is_authanticated,
		last_posts: await posts.last_posts_by_user(user_id, 5),
		last_comments: await comments.last_comments_by_user(user_id, 5),
		user_post_count: await posts.user_post_count(user_id),
		user_comment_count: await comments.user_comment_count(user_id),
	});
});

module.exports = router;

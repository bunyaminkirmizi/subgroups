const express = require("express");
const { authentication_required } = require("../db/auth");
const auth = require("../db/auth");
const posts = require("../db/posts");
const groups = require("../db/groups");
const votes = require("../db/votes");
const comments = require("../db/comments");
const service_notifications = require('../services/notifications');
const router = express.Router();
router.use(express.urlencoded({ extended: true }));

async function ownership_required(req, res, next) {
	const user_id = req.session.user.user_id;
	const post_id = req.query.post_id;
	const post = await posts.get_post(post_id);
	if (post == undefined) {
		res.redirect("/");
	} else if (post.user_id == user_id) {
		next();
	} else {
		console.log(
			"delete rejected because post" +
			post.post_id +
			"owner is " +
			post.user_id +
			" but user" +
			user_id +
			"tried to delete it"
		);
		res.redirect("/");
	}
}

router.post(
	"/sendcomment/:post_id",
	auth.authentication_required,
	async (req, res) => {
		const post_id = req.params.post_id;
		const comment_body = req.body.commenttext;
		const user_id = req.session.user.user_id;
		comments.add_comment(user_id, post_id, comment_body);

		res.redirect("/post/detail?post_id=" + post_id);
	}
);
router.get("/uploads/posts/:filename", function (req, res) {
	const filepath = "./uploads/posts/" + req.params.filename;
	res.sendFile(filepath, { root: require("path").resolve(__dirname, "..") });
});

router.get("/detail", async (req, res) => {
	const post_id = req.query.post_id;
	const post = await posts.get_post_with_user_given_vote(
		post_id,
		req.session.user
	);
	if (post == undefined) {
		res.redirect("/404");
		return;
	}
	const group_id = post.group_id;
	const current_group = await groups.get_group(group_id);
	if (current_group != undefined) {
		const commentofpage = await comments.get_comment_by_post(post_id);
		const g_dropdown = {
			current: current_group,
			parent: { group_id: "2", group_name: "parent" },
			subs: await groups.get_subs((await groups.get_group(group_id)).group_id),
		};
		console.log("g_dropdown", g_dropdown);
		res.render("pages/detail", {
			title: "sub | " + g_dropdown.current.group_name,
			user: req.session.user,
			is_authenticated: auth.is_authanticated(req.session),
			group: g_dropdown,
			post: post,
			comments: await comments.get_comment_by_post(post_id),
		});
		return;
	}
	res.send("if didnt worked");
});

router.get(
	"/delete/",
	authentication_required,
	ownership_required,
	async (req, res) => {
		const post_id = req.query.post_id;
		const post = await posts.get_post(post_id);
		posts.delete_post(post_id);
		res.redirect("/group/" + post.group_id);
	}
);

router.post(
	"/update/",
	authentication_required,
	ownership_required,
	async (req, res) => {
		const group_id = req.body.group_id;
		const post_body = req.body.post_body;
		const post_header = req.body.post_header;
		const post_id = req.query.post_id;
		await posts.update_post(post_id, post_header, post_body);
		res.redirect("/group/" + group_id);
	}
);

router.get("/vote", auth.authentication_required, async (req, res) => {
	const user_id = req.session.user.user_id;
	const post_id = req.query.post_id;
	const vote = req.query.vote;
	let user_vote = undefined;
	const voted = await votes.get_vote_type(user_id, post_id);
	if (vote == "up") {
		console.log(voted, vote);
		if (voted == true) {
			await votes.remove_old_vote_if_exists(user_id, post_id);
			user_vote = undefined;
		} else if (voted == false) {
			await posts.upvote(user_id, post_id);
			user_vote = true;
		} else if (voted == undefined) {
			await posts.upvote(user_id, post_id);
			user_vote = true;
		}
	}

	if (vote == "down") {
		if (voted == false) {
			await votes.remove_old_vote_if_exists(user_id, post_id);
			user_vote = undefined;
		} else if (voted == true) {
			await posts.downvote(user_id, post_id);
			user_vote = false;
		} else if (voted == undefined) {
			await posts.downvote(user_id, post_id);
			user_vote = false;
		}
	}
	const vc = await votes.get_vote_count(post_id);
	res.send({ vote_count: vc, user_vote: user_vote });
});

module.exports = router;

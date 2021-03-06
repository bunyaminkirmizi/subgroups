const express = require("express");
const session = require("express-session");
const path = require("path");
const multer = require("multer");

const banner_upload = multer({
	dest: "./public/group_banners/",
	limits: { fileSize: 1000000 * 90 },
});
const auth = require("./../db/auth");
const groups = require("./../db/groups");
const posts = require("./../db/posts");
const { TreeNode } = require("./../db/tree");
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.post(
	"/changebanner/:group_id",
	banner_upload.single("group_banner_file"),
	(req, res) => {
		const group_id = req.params.group_id;
		let filepath = null;
		if (req.file) {
			console.log(req.file);
			groups.add_banner(group_id, req.file.filename);
		} else {
			console.log("req.file didn't worked");
		}
		res.redirect("/group/" + group_id);
	}
);

router.get(
	"/delete/:group_id",
	auth.authentication_required,
	group_ownership_required,
	async (req, res) => {
		const group_id = req.params.group_id;
		req.query.group_id = group_id;
		try {
			const parent = await groups.get_parent(group_id);
			console.log("papapaprent==>", parent);
			await groups.delete_group(group_id);
			res.redirect("/group/" + parent.parent_group_id);
		} catch {
			console.log("can't get group parent");
			groups.delete_group(group_id);
			res.redirect("/");
			return;
		}
	}
);

router.post("/new", auth.authentication_required, async (req, res) => {
	const group_name = req.body.groupname;
	const parent_group_id = req.body.parent_group_id;
	const user_id = req.session.user.user_id;
	const new_group = await groups.create_group_under_parent(
		user_id,
		group_name,
		parent_group_id
	);
	if (new_group == undefined) {
		res.redirect("/");
		return;
	}
	res.redirect("/group/" + new_group);
});

router.get(
	"/join/:group_id",
	auth.authentication_required,
	async (req, res) => {
		const group_id = req.params.group_id;
		const user_id = req.session.user.user_id;

		await groups.join_group(user_id, group_id);
		console.log("joingroup=>", await groups.is_participant(user_id, group_id));
		res.redirect("/group/" + req.params.group_id);
	}
);

async function group_ownership_required(req, res, next) {
	const user_id = req.session.user.user_id;
	const group_id = req.params.group_id;
	const group = await groups.get_group(group_id);
	console.log("group ownership check", user_id, group_id, group);
	if (group == undefined) {
		res.redirect("/");
	} else if (group.user_id == user_id) {
		next();
	} else {
		console.log(
			"ownership rejected because group" +
				group_id +
				"owner is " +
				group.user_id +
				" but user" +
				user_id +
				" tried action"
		);
		res.redirect("/");
	}
}

router.get(
	"/makeprivate/:group_id",
	auth.authentication_required,
	group_ownership_required,
	async (req, res) => {
		const group_id = req.params.group_id;
		const user_id = req.session.user.user_id;

		groups.make_group_private(group_id);
		console.log("stastus", await groups.get_status(group_id));
		res.redirect("/group/" + req.params.group_id);
	}
);

router.get(
	"/makepublic/:group_id",
	auth.authentication_required,
	group_ownership_required,
	async (req, res) => {
		const group_id = req.params.group_id;
		const user_id = req.session.user.user_id;
		console.log("stastus", await groups.get_status(group_id));
		groups.make_group_public(group_id);
		// console.log("make_group_public=>",await groups.is_participant(user_id,group_id));
		res.redirect("/group/" + req.params.group_id);
	}
);

router.get(
	"/leave/:group_id",
	auth.authentication_required,
	async (req, res) => {
		const group_id = req.params.group_id;
		const user_id = req.session.user.user_id;
		await groups.leave_group(user_id, group_id);
		console.log("leavegroup=>", await groups.is_participant(user_id, group_id));
		res.redirect("/group/" + req.params.group_id);
	}
);

router.post(
	"/changeabout/:group_id",
	auth.authentication_required,
	async (req, res) => {
		const group_about_text = req.body.groupabouttext;
		const group_id = req.params.group_id;
		groups.add_info(group_id, group_about_text);
		res.redirect("/group/" + group_id);
	}
);

router.get("/:group_id", async (req, res) => {
	const group_id = req.params.group_id;
	if (!(await groups.get_group(group_id))) {
		//if group does not exist
		res.redirect("/");
		return;
	}
	let group_info = {
		is_participant: false,
		is_owner: false,
		banner: true,
		status: await groups.get_status(group_id),
	};
	// console.log("satuususuusususu",)
	if (auth.is_authanticated(req.session)) {
		const user_id = req.session.user.user_id;
		group_info = {
			is_participant: await groups.is_participant(user_id, group_id),
			is_owner: await groups.is_owner(user_id, group_id),
			banner: false,
			status: await groups.get_status(group_id),
		};
		console.log("group_info", group_info);
	}
	console.log("group info", group_info);
	const current_group = await groups.get_group(group_id);
	let tree = new TreeNode();
	await groups.recursive_group_traverse(group_id, tree);
	if (current_group != undefined) {
		const g_dropdown = {
			current: current_group,
			parent: { group_id: "2", group_name: "parent" },
			subs: await groups.get_subs((await groups.get_group(group_id)).group_id),
			parents: (await groups.get_parents(group_id, [])).reverse(),
			info: group_info,
		};
		res.render("pages/group", {
			title: "grup | " + g_dropdown.current.group_name,
			user: req.session.user,
			is_authenticated: auth.is_authanticated(req.session),
			group: g_dropdown,
			posts: await posts.get_post_by_group(
				group_id,
				req.session.user,
				req.query.filter
			),
			tree: tree,
			// message: req.message,
			filter: { name: req.query.filtername },
		});
		return;
	}

	res.render("pages/404", {
		title: "register",
		is_authenticated: auth.is_authanticated(req.session),
		user: req.session.user,
	});
});

module.exports = router;

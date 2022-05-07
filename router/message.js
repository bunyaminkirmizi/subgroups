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

router.post(
	"/sendto/:receiver_id",
	auth.authentication_required,
	async (req, res) => {
		const sender_id = req.session.user.user_id;
		const receiver_id = req.params.receiver_id;
		const text = req.body.messagetext;
		const header = req.body.messageheader;
		messages.add_message(sender_id, receiver_id, header, text);
		res.send(`${sender_id},${receiver_id},${text}, ${header}`);
	}
);

router.get("/inbox/", auth.authentication_required, async (req, res) => {
	const user_id = req.session.user.user_id;
	const user_inbox_messages =
		await messages.get_message_by_user_date_desc_order(user_id);
	console.log(user_inbox_messages);
	res.send(`${JSON.stringify(user_inbox_messages)}`);
});

module.exports = router;

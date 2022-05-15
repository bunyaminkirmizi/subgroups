const express = require("express");
const multer = require("multer");
const auth = require("../db/auth");
const webpush = require("web-push");
const dbsrch = require("../db/search");
const { user } = require("pg/lib/defaults");
const router = express.Router();
const vapidKeys = {
	publicKey:
		"BHKZ8uO6aZgAvzK5OcjyXcqv6BoZ8muK85w6zwtDgTNSJwgEZoVEHctIyXTkU9xUksoOU7hoW0Dhg7gyIzfg7QE",
	privateKey: "cBeNiC3Y9D7Ly9s1H5Wp4TkwisF2qvEXLIU4hOYyUxQ",
};

router.use(require("body-parser").json());

webpush.setVapidDetails(
	"mailto:asdfasdfasdfdasfas@asdfasdfsadf.io",
	vapidKeys.publicKey,
	vapidKeys.privateKey
);
let arrayofsubscribers = [];

router.post("/subscribe", (req, res) => {
	const subscription = req.body;
	console.log('subscription==>', subscription)
	arrayofsubscribers.push(subscription);
	// if(auth.is_authanticated()){
	// 	const user = req.session.user

	// }
	console.log(subscription);
	res.status(201).json({});
	const payload = JSON.stringify({
		title: "test",
		icon: "https://www.w3schools.com/css/paris.jpg"
	});
	webpush.sendNotification(subscription, payload).catch((error) => {
		console.error(error.stack);
	});
});


module.exports = router;

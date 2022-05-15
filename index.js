const path = require("path");
const express = require("express");
// const session = require("express-session");
const multer = require("multer");
const http = require('http');
const sessionmiddleware = require('./sessionmiddleware')

const upload = multer({
	dest: "./uploads/posts/",
	limits: { fileSize: 1000000 * 90 },
});
const banner_upload = multer({
	dest: "./public/group_banners/",
	limits: { fileSize: 1000000 * 90 },
});

require("dotenv").config();
const app = express();
// const session_middleware = session({
// 	name: "sid",
// 	secret: process.env.SESSIONSECURESTRING,
// 	resave: false,
// 	saveUninitialized: true,
// 	cookie: { sameSite: false, secure: false },
// })
const session_middleware = sessionmiddleware.session_middleware
app.use(
	session_middleware
);

const user = require("./router/user");
const post = require("./router/post");
const group = require("./router/group");
const message = require("./router/message");
const search = require("./router/search");
const notification = require("./router/notification");

app.use("/user", user);
app.use("/message", message);
app.use("/post", post);
app.use("/group", group);
app.use("/search", search);
app.use("/notification", notification);

const port = process.env.PORT;
const auth = require("./db/auth");
const groups = require("./db/groups");
const posts = require("./db/posts");
const stats = require("./db/stats");
app.use(express.urlencoded({ extended: true })); //Used fore parsing body elements
app.set("trust proxy", 1); // trust first proxy
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
	if (auth.is_authanticated(req.session)) {
		const user_id = req.session.user.user_id;
		res.render("pages/userhome", {
			title: "subgroups",
			user: req.session.user,
			is_authenticated: true,
			groups_user_joined: await groups.get_user_participant_groups(user_id),
			posts_from_user_joined_groups: await posts.get_user_joined_group_posts(
				user_id
			),
			user_owned_groups: await groups.get_user_owned_groups(user_id),
			last_posts_from_public_groups: await posts.last_posts_from_public_groups(
				5
			),
			new_groups: await groups.new_groups(5),
		});
		return;
	}

	console.log("entered homepage");
	res.render("pages/home", {
		title: "subgroups",
		user: req.session.user,
		is_authenticated: auth.is_authanticated(req.session),
		statistics: await stats.lastweek(),
	});
});

app.post("/upload/:filename", upload.single("filename"), (req, res) => {
	let filepath = null;
	if (req.file) {
		console.log("file uploaded" + req.file.filename);
		filepath = "/post/uploads/posts/" + req.file.filename;
	} else {
		console.log("req.file didn't worked");
	}
	res.send({
		filename: req.params.filename,
		filepath: filepath,
	});
});

app.post("/register/", async (req, res) => {
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const passwordagain = req.body.passwordagain;
	const register = await auth.register(
		username,
		email,
		password,
		passwordagain
	);
	res.render("pages/register", {
		title: "register",
		is_authenticated: false,
		message: register[1],
	});
});

app.get("/login/", auth.allow_just_not_logged_in, (req, res) => {
	res.render("pages/login", {
		title: "login",
	});
});

app.get("/register/", auth.allow_just_not_logged_in, (req, res) => {
	res.render("pages/register", {
		title: "register",
		is_authenticated: auth.is_authanticated(req.session),
	});
});

app.get("/logout/", auth.authentication_required, (req, res) => {
	req.session.user = null;
	res.redirect("/");
});

app.post("/login/", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const remember_me = req.body.remember_me;
	var message = null;
	const authentication = await auth.authenticate(
		username,
		password,
		remember_me
	);
	req.session.user = authentication[0];
	message = authentication[1];
	if (auth.is_authanticated(req.session)) {
		res.redirect("/");
	} else {
		res.render("pages/login", {
			title: "login",
			message: message,
		});
	}
});

app.get("/howto", async (req, res) => {
	// const user_id = req.session.user.user_id
	console.log(req.session.user);
	res.render("pages/howto.pug", {
		title: "nasıl kullanırım?",
		user: req.session.user,
		is_authenticated: auth.is_authanticated(req.session),
	});
});

app.get("/about/", function (req, res) {
	res.render("pages/about", {
		title: "Hakkında",
		is_authenticated: auth.is_authanticated(req.session),
		user: req.session.user,
	});
});
app.get("/test/:deneme", (req, res) => {

	const title = req.params.deneme
	io.to(title).emit('notification', {
		title: title,
		icon: 'icon',
		body: 'body',
		onclickurl: 'onclick'
	})
	res.send("ok");
});



// app.listen(port, () => {
// 	console.log(`subgroups app listening on port ${port}`);
// });
const server = http.createServer(app);
const { Server } = require("socket.io");

server.listen(process.env.PORT || 3000, () => {
	console.log(`App running on port ${process.env.PORT || 3000}`);
});

const io = new Server(server);


const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(session_middleware));
io.use((socket, next) => {
	const session = socket.request.session;
	if (session && session.user) {
		next();
	} else {
		next(new Error("unauthorized"));
	}
});

io.on('connection', async (socket) => {
	const user = socket.request.session.user
	// console.log('a user connected with id=', socket.id, 'socket session=', user);
	const user_groups = await groups.get_user_participant_groups(user.user_id)
	for (let index = 0; index < user_groups.length; index++) {
		const element = user_groups[index];
		console.log(`user in ${element.group_id}`)
		socket.join(`group:${element.group_id}`);
	}

	socket.join(`some room`);
	socket.on('notification', data => {
		console.log(data)
		socket.emit('notification', {
			title: 'test',
			icon: 'https://www.w3schools.com/css/paris.jpg',
			body: 'body',
			onclickurl: 'onclick'
		})
	})

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

app.post("/post/new/", auth.authentication_required, async (req, res) => {
	const group_id = req.body.group_id;
	const post_body = req.body.post_body;
	const post_header = req.body.post_header;
	const user_id = req.session.user.user_id;
	const multimedia_paths = req.body.images.split(",");
	// console.log("multimedia_pathsssssss===>", multimedia_paths);
	const room = `group:${group_id}`
	const lastpostid = await posts.add_post(
		user_id,
		group_id,
		post_header,
		post_body,
		multimedia_paths
	);
	let iconurl = ''
	if (multimedia_paths == ['']) {
		iconurl = '/favicon.ico'
	} else {
		iconurl = multimedia_paths[0]
	}
	io.to(room).emit('notification', {
		title: post_header,
		icon: iconurl,
		body: post_body,
		onclickurl: `http://localhost:9095/post/detail?post_id=${lastpostid}`
	})


	console.log('=>send notification to group_id', room)


	// console.log('lastadddepostid',lastpostid)
	// service_notifications.send_new_post_notification(lastpostid)
	res.redirect("/group/" + group_id);
});

app.get("*", function (req, res) {
	res.render("pages/404", {
		title: "Sayfa bulunamadı",
		is_authenticated: auth.is_authanticated(req.session),
		user: req.session.user,
	});
});

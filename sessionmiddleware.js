const session = require("express-session");
require("dotenv").config();
const session_middleware = session({
	name: "sid",
	secret: process.env.SESSIONSECURESTRING,
	resave: false,
	saveUninitialized: true,
	cookie: { sameSite: false, secure: false },
})

module.exports = {
	session_middleware: session_middleware
}
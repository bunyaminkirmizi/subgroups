const express = require("express");
// const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();

const auth = require("./auth");
const group = require("./db/group");

const port = process.env.PORT;

const app = express();

app.use(
  session({
    name: "sid",
    cookie: {
      sameSite: true,
      secure: false, //for development false but production true
    },
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const user = require("./router/user");
const post = require("./router/post");
const sub = require("./router/sub");

app.use("/user", user);
app.use("/post", post);
app.use("/sub", sub);

app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }));
session.lastsubclicked = "main";
app.use("/static", express.static("public"));

app.get("/", async (req, res) => {
  const { user_id } = req.session;
  let options = {};
  if (auth.is_authenticated(req)) {
    res.redirect("/sub/main");
    return;
  } else {
    options = {
      title: "homepage",
      is_authenticated: false,
      data: "user not logged in",
      groupdropdown: await group.get_group_dropdown(1),
      //messages: messageque.consume_message(req.session)
    };
  }
  res.render("page/home.pug", options);
});

app.get("/login", (req, res) => {
  console.log("messages", req.session.messages);
  res.render("page/login.pug", {
    title: "login",
    // messages: messageque.consume_message(req.session)
  });
});

app.get("/signup", (req, res) => {
  res.render("page/signup.pug", {
    title: "signup",
  });
});

app.post("/login", async (req, res) => {
  const validation = await auth.authenticate(
    req.body.username,
    req.body.password,
    req.session
  );
  // console.log(`login post:\n=>username: ${req.body.username}\n=>password: ${req.body.password}`)
  // console.log(`\n=>rememberme: ${req.body.rememberme}`)
  // console.log("===========================================================================")
  if (validation) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.post("/signup", async (req, res) => {
  // console.log(`signup post:\n=>useruname: ${req.body.username}`)
  // console.log(`=>email: ${req.body.email}`)
  // console.log(`=>password: ${req.body.password}`)

  // console.log("=====================================================================================")
  if (
    auth.register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    })
  ) {
    res.redirect("/login");
  } else {
    res.redirect("/signup");
  }
});

app.get("/testpug", (req, res) => {
  res.render("testpug.pug");
});

app.get("/logout", auth.authentication_required, (req, res) => {
  if (req.session.user_id) {
    req.session.user_id = null;
  }
  res.redirect("/");
});

app.listen(port);

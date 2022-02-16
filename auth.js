const bcrypt = require("bcrypt");
const db_user = require("./db/user");

async function authenticate(username, password, session) {
  const user_from_db = (await db_user.get_by_username(username))[0];
  if (user_from_db) {
    const user = {
      id: user_from_db.id,
      username: user_from_db.username,
      email: user_from_db.email,
      register_timestamp: user_from_db.register_timestamp,
      authenticated: await bcrypt.compare(
        password,
        user_from_db.hashed_password
      ),
    };

    if (user.authenticated) {
      console.log(user, "authenticated");
      session.messages = [
        { body: "user succesfully authenticated", type: "success" },
      ];
      session.user_id = user;
      return true;
    } else {
      session.messages = [{ body: "password doesnt match", type: "danger" }];
      console.log("password doesnt match");
      return false;
    }
  } else {
    console.log("user does not exist");
    session.messages = [{ body: "user does not exist", type: "danger" }];
    return false;
  }
}

async function register(user) {
  const hashed_password = await bcrypt.hash(user.password, 12);
  var datetime = new Date();
  date = datetime.toISOString().slice(0, 10);
  const result = await db_user.add(
    user.username,
    user.email,
    hashed_password,
    date
  );
  console.log(result);
  return result;
}

function is_authenticated(req) {
  const user = req.session.user_id;
  if (user) {
    return user.authenticated;
  }

  return false;
}

function authentication_required(req, res, next) {
  console.log("auth req", is_authenticated(req));
  if (is_authenticated(req)) return next();

  res.redirect("/login");
}

module.exports = {
  is_authenticated,
  authentication_required,
  authenticate,
  register,
};

// const connect = require('./connect');
const bcrypt = require("bcrypt");
const users = require("./users");
const top_notifications = require("../top_notifications");

function err_message(err_msg) {
	return top_notifications.top_bar_message("BAŞARISIZ: ", err_msg, "danger");
}

function password_validation(password, passwordagain) {
	if (password.localeCompare(passwordagain)) {
		let e = "Parolalar uyuşmuyor";
		return [false, err_message(e)];
	}
	if (password.length < 8) {
		let e = "Şifreniz 8 karakterden kısa olamaz";
		return [false, err_message(e)];
	} else {
		return [true, undefined];
	}
}

async function email_validation(email) {
	if ((await users.get_user_by_email(email)) != undefined) {
		let e = "Email '" + email + "' zaten mevcut.";
		// console.log()
		return [false, err_message(e)];
	}
	var emailRegex =
		/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
	if (!email) return [false, err_message("Email cant be null")];
	if (email.length > 254) {
		// console.error("AUTH: ")
		return [false, err_message("Email cant have more than 254 character")];
	}

	var valid = emailRegex.test(email);
	if (!valid) {
		return [false, err_message("Geçersiz Email")];
	}

	var parts = email.split("@");
	if (parts[0].length > 64)
		return [false, err_message("E-mail part can't be longer than 64")];
	var domainParts = parts[1].split(".");
	if (
		domainParts.some(function (part) {
			return part.length > 63;
		})
	)
		return [false, err_message("Domain part can't be longer than 63")];
	return [true, undefined];
}

async function username_validation(username) {
	if (username.length < 4) {
		let e = "Kullanıcı adı 5 karakterden kısa olamaz";
		return [false, err_message(e)];
	}

	if (username.length > 15) {
		let e = "Kullanıcı adı 15 karakterden uzun olamaz";
		return [false, err_message(e)];
	}

	if ((await users.get_user_by_username(username)) != undefined) {
		let e = "Kullanıcı adı '" + username + "' zaten mevcut.";
		// console.log()
		return [false, err_message(e)];
	}
	return [true, undefined];
}

async function register(username, email, password, passwordagain) {
	const validation = {
		password: password_validation(password, passwordagain),
		email: await email_validation(email),
		username: await username_validation(username),
	};
	if (!validation.username[0]) {
		//username problem
		return [false, validation.username[1]];
	}
	if (!validation.email[0]) {
		//email problem
		return [false, validation.email[1]];
	}
	if (!validation.password[0]) {
		//username problem
		return [false, validation.password[1]];
	}
	const hashed_password = await bcrypt.hash(password, 12);
	users.add_user(username, email, hashed_password);
	return [
		true,
		top_notifications.top_bar_message(
			"Başarılı: ",
			"Başarılı bir şekilde kayıt oldunuz. Şimdi giriş sayfasını kullanabilirsiniz",
			"success"
		),
	];
}
async function authenticate(username, password, remember_me) {
	var db_user = await users.get_user_by_username(username);

	if (db_user == undefined) {
		let e = "Bu kullanıcı adında bir kullanıcı yok '" + username + "'";
		console.error(e);

		return [undefined, err_message(e)];
	}

	if (await bcrypt.compare(password, db_user.password_hash)) {
		var success_message = username + " Başarıyla giriş yapıldı";
		return [db_user, undefined];
	} else {
		var e = "Yanlış parola!";
		console.error(e);
		return [undefined, err_message(e)];
	}
}
function is_authanticated(session) {
	const user = session.user;
	if (session.user) {
		return true;
	} else {
		return false;
	}
}

function allow_just_not_logged_in(req, res, next) {
	if (is_authanticated(req.session)) {
		res.redirect("/");
	} else {
		next();
	}
}

function authentication_required(req, res, next) {
	if (is_authanticated(req.session)) {
		next();
	} else {
		res.redirect("/login/");
	}
}
module.exports = {
	register: register,
	authenticate: authenticate,
	is_authanticated: is_authanticated,
	authentication_required: authentication_required,
	allow_just_not_logged_in: allow_just_not_logged_in,
};

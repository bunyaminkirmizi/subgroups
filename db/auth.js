const { redirect } = require('express/lib/response');
const connect = require('./connect');
const bcrypt = require("bcrypt");
const users = require("./users");
const top_notifications = require("../top_notifications");

function err_message(err_msg) {
	return top_notifications.top_bar_message("Failed: ",err_msg,"danger")
}

function password_validation(password,passwordagain){
	if(password.localeCompare(passwordagain)){
		let e = "AUTH: passwords do not match"
		return [false,err_message(e)]
	}
	if(password.length<8){
		let e = "AUTH: password can't be that short(<8)"
		return [false,err_message(e)]
	}else{
		return [true,undefined]
	}
}

function email_validation(email) {
	var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (!email)
	
        return [false,err_message("Email cant be null")];
    if(email.length>254){
		// console.error("AUTH: ")
		return [false,err_message("Email cant have more than 254 character")];
	}
        
    var valid = emailRegex.test(email);
    if(!valid){
		// console.error("AUTH: invalid email")
		return [false,err_message("Invalid email")];
	}
        
    var parts = email.split("@");
    if(parts[0].length>64)
        return [false,err_message("E-mail part can't be longer than 64")];
    var domainParts = parts[1].split(".");
    if(domainParts.some(function(part) { return part.length>63; }))
        return [false,err_message("Domain part can't be longer than 63")];
    return [true,undefined];
}

async function username_validation(username) {
	if(username.length<4){
		let e  = "Username can't be shorter than 5"
		return [false,err_message(e)]
	}
	
	if(username.length>15){
		let e = "Username can't be longer than 15 char"
		return [false,err_message(e)]
	}

	if((await users.get_user_by_username(username)) != undefined){
		let e = "User with username '"+ username+"' already exists"
		// console.log()
		return [false,err_message(e)]
	}
	return [true,undefined]
}

async function register(username,email,password,passwordagain) {
	const validation = {
		password: password_validation(password,passwordagain),
		email: email_validation(email),
		username: await username_validation(username)
	}
	// console.log(validation.username[0],validation.email[0],validation.password[0])
	if(!validation.username[0]){
		//username problem
		return [false,validation.username[1]]
	}
	if(!validation.email[0]){
		//email problem
		return [false,validation.email[1]]
	}
	if(!validation.password[0]){
		//username problem
		return [false,validation.password[1]]
	}
	const hashed_password = await bcrypt.hash(password, 12);
	users.add_user(username,email,hashed_password)
	// console.log("[LOG]:",username,email,"registered to database")
	return [true,top_notifications.top_bar_message("Success: ","Successfully registered. Now you can use log in page","success")]
}
async function authenticate(username,password,remember_me) {
	var db_user = await users.get_user_by_username(username)

	if(db_user == undefined){
		let e = "There is no such user with name '"+username+"'";
		console.error(e)
		
		return [undefined,err_message(e)]
	}

	// console.log("log:",password,db_user.password_hash);
	if (await bcrypt.compare(password,db_user.password_hash)){
		var success_message= username + " succesfully logged in"
		// console.log(success_message);
		return [db_user,undefined]
	}else{
		var e = "Wrong password!";
		console.error(e)
		return [undefined,err_message(e)]
	}
	
}
function is_authanticated(session) {
	const user = session.user
	// console.log("is authenticated check for",user);
	if(session.user){
		return true;
	}else{
		return false;
	}
}

function allow_just_not_logged_in(req,res,next) {
	if(is_authanticated(req.session)){
		// res.redirect("/login/")
		res.redirect("/")
	}else{
		next()
	}
}

function authentication_required(req,res,next) {

	if(is_authanticated(req.session)){
		next()
	}else{
		res.redirect("/login/")
	}
}
module.exports = {
	register:register,
	authenticate:authenticate,
	is_authanticated:is_authanticated,
	authentication_required:authentication_required,
	allow_just_not_logged_in:allow_just_not_logged_in
}
const connect = require('./connect');

function add_user(username,email,password) {
	connect.pool.query(
		"INSERT INTO users(username,email,password_hash,register_timestamp,email_activation_pass)values($1,$2,$3,current_timestamp,FALSE)",
		[username,email,password],
		(err)=>console.log(err))
	}

async function get_user_by_username(username) {
	var user = null
	const sqltext = 'SELECT * FROM users WHERE username =$1'
	const values = [username]
	try {
		user = (await connect.pool.query(sqltext, values)).rows[0]
	  } catch (err) {
		console.log(err.stack)
	  }
	return user;
	}
async function get_user_by_id(user_id) {
	var user = null
	const sqltext = 'SELECT * FROM users WHERE user_id=$1'
	const values = [user_id]
	try {
		user = (await connect.pool.query(sqltext, values)).rows[0]
		} catch (err) {
		console.log(err.stack)
		}
		return user;
	
	}
	

	
async function delete_user(user_id) {
	const sqltext = 'DELETE FROM users WHERE user_id =$1'
	const values = [user_id]
	try {
		await connect.pool.query(sqltext, values)
		} catch (err) {
		console.log(err.stack)
		}
	}
async function add_profile_photo(user_id,ppath) {
	// console.log(ppath,user_id)
	const sqltext = 'UPDATE users SET profile_photo_path = $2 WHERE user_id = $1;'
	const values = [user_id,ppath]
	try {
		return await connect.pool.query(sqltext, values)
		} catch (err) {
		console.log(err.stack)
		}
	}

module.exports = {
	add_user:add_user,
	get_user_by_username:get_user_by_username,
	get_user_by_id:get_user_by_id,
	delete_user:delete_user,
	add_profile_photo:add_profile_photo

}
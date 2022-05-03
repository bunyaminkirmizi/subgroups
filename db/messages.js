//send message
//get message
//delete message

//create
//delete
//update

// message_id BIGSERIAL PRIMARY KEY,
// user_id_sender int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
// user_id_receiver int NOT NULL REFERENCES users(user_id),
// header varchar(30) NOT NULL,
// cryptic_text TEXT NOT NULL,
// is_read boolean DEFAULT FALSE NOT NULL,
// send_timestamp timestamp

const connect = require('./connect');
const users = require('./users');
const votes = require('./votes');

async function add_message(user_id_sender,user_id_receiver,header,cryptic_text) {
	const sqltext = "INSERT INTO posts(user_id_sender,user_id_receiver,header,cryptic_text,send_timestamp) values($1,$2,$3,$4,current_timestamp)" 
	const values = 	[user_id_sender,user_id_receiver,header,cryptic_text]
	connect.pool.query(
			sqltext,
			values,
			(err)=>console.log(err))
	}
	
async function delete_message(message_id) {
	const sqltext = "DELETE FROM messages WHERE message_id = $1;"
	const values = [message_id]
	connect.run_query_no_rows(sqltext,values)
}

async function get_message_by_id(message_id) {
	const sqltext = 'SELECT * FROM messages WHERE message_id =$1'
	const values = [message_id]

	try {
		const row = (await connect.pool.query(sqltext, values)).rows
		return row
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function get_message_by_user_date_desc_order(user_id) {
	const sqltext = 'SELECT * FROM messages WHERE user_id =$1 ORDER BY DESC'
	const values = [user_id]

	try {
		const res = (await connect.pool.query(sqltext, values)).rows
		return res
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}


async function read_message(message_id) {
	const sqltext = "UPDATE messages SET is_read = t WHERE message_id = $2;"
	const values = [message_id]
	connect.run_query_no_rows(sqltext,values)
}

module.exports = {
	delete_messsage:delete_message,
	add_message:add_message,
	get_message_by_user_date_desc_order:get_message_by_user_date_desc_order,
	read_message:read_message
}
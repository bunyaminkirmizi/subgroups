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

const connect = require("./connect");

async function add_message(
	user_id_sender,
	user_id_receiver,
	header,
	cryptic_text
) {
	const sqltext =
		"INSERT INTO messages(user_id_sender,user_id_receiver,header,cryptic_text,send_timestamp) values($1,$2,$3,$4,current_timestamp)";
	const values = [user_id_sender, user_id_receiver, header, cryptic_text];

	return await connect.run_query_no_rows(sqltext, values);
}

async function delete_message(message_id) {
	const sqltext = "DELETE FROM messages WHERE message_id = $1;";
	const values = [message_id];

	return await connect.run_query_no_rows(sqltext, values);
}

async function get_message_by_id(message_id) {
	const sqltext = "SELECT * FROM messages WHERE message_id =$1";
	const values = [message_id];

	return await connect.run_query_select_first_row(sqltext, values);
}

async function get_message_by_user_date_desc_order(user_id, limit) {
	//if limit is null then all the rows will be returned
	const sqltext =
		"SELECT * FROM messages WHERE user_id_sender = $1 or user_id_receiver = $1 ORDER BY send_timestamp DESC LIMIT $2;";
	const values = [user_id, limit];

	return await connect.run_query_select_rows(sqltext, values);
}

async function read_message(message_id) {
	const sqltext = "UPDATE messages SET is_read = t WHERE message_id = $2;";
	const values = [message_id];

	await connect.run_query_no_rows(sqltext, values);
}

module.exports = {
	delete_messsage: delete_message,
	add_message: add_message,
	get_message_by_user_date_desc_order: get_message_by_user_date_desc_order,
	read_message: read_message,
};

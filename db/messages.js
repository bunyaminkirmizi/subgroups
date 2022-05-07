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
	console.log(values, "before goes to function");
	return await connect.run_query_select_rows(sqltext, values);
}

async function get_messages_between_users_date_asc_order(
	user_id_sender,
	user_id_receiver,
	limit
) {
	//if limit is null then all the rows will be returned
	const sqltext =
		"SELECT * FROM messages WHERE (user_id_sender = $1 and user_id_receiver = $2) or (user_id_sender = $2 and user_id_receiver = $1) ORDER BY send_timestamp DESC LIMIT $3;";
	const values = [user_id_sender, user_id_receiver, limit];
	console.log(values, "before goes to function");
	return await connect.run_query_select_rows(sqltext, values);
}

async function get_last_messages(user_id) {
	//if limit is null then all the rows will be returned
	const sqltext = `
	select users.username,users.profile_photo_path, last.counter , last.message_id,last.user_id_sender,last.user_id_receiver,last.username,last.send_timestamp,last.cryptic_text
	from
	(select DISTINCT ON (counter) last_messages.counter as counter , last_messages.message_id,last_messages.user_id_sender,last_messages.user_id_receiver,last_messages.username,last_messages.send_timestamp,last_messages.cryptic_text
	from
	(SELECT DISTINCT ON (counter)  messages.user_id_sender as counter , messages.message_id,messages.user_id_sender,messages.user_id_receiver,users.username,messages.send_timestamp,messages.cryptic_text
	FROM messages
	LEFT JOIN users
	ON messages.user_id_receiver = users.user_id
	where user_id = $1
	UNION SELECT DISTINCT ON (counter) messages.user_id_receiver as counter ,messages.message_id,messages.user_id_sender,messages.user_id_receiver,users.username,messages.send_timestamp,messages.cryptic_text
	FROM messages
	LEFT JOIN users
	ON messages.user_id_sender = users.user_id
	where user_id = $1
	order by send_timestamp desc
	) as last_messages) as last
	left join users
	on users.user_id = last.counter;
	--ORDER BY send_timestamp desc;
	`;
	// (select * from messages where user_id_sender =8 and user_id_receiver=2 union select * from messages where user_id_sender =2 and user_id_receiver=8  order by send_timestamp desc limit 1) as last_message;
	const values = [user_id];
	console.log(values, "before goes to function");
	return await connect.run_query_select_rows(sqltext, values);
}
async function read_message(message_id) {
	const sqltext = "UPDATE messages SET is_read = t WHERE message_id = $1;";
	const values = [message_id];

	await connect.run_query_no_rows(sqltext, values);
}

module.exports = {
	delete_messsage: delete_message,
	add_message: add_message,
	get_message_by_user_date_desc_order: get_message_by_user_date_desc_order,
	read_message: read_message,
	get_messages_between_users_date_asc_order:
		get_messages_between_users_date_asc_order,
	get_last_messages: get_last_messages,
};

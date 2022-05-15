//create
//delete
//update

// notification_id BIGSERIAL PRIMARY KEY,
// user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
// header varchar(50),
// body TEXT NOT NULL,
// send_timestamp timestamp,
// icon_path varchar(255)

const connect = require("./connect");
const users = require("./users");
const votes = require("./votes");

async function add_user_endpoint(user_id,auth,endpointurl) {
	connect.pool.query(
		"INSERT INTO posts(user_id,header,body,icon_path,send_timestamp) values($1,$2,$3)",
		[user_id, auth, endpointurl],
		(err) => console.log(err)
	);
	
}
async function add_notification(user_id, header, body, icon_path) {
	connect.pool.query(
		"INSERT INTO posts(user_id,header,body,icon_path,send_timestamp) values($1,$2,$3,$4,current_timestamp)",
		[user_id, header, body, icon_path],
		(err) => console.log(err)
	);
}

async function del_notification(notification_id) {
	connect.pool.query(
		"DELETE FROM notifications WHERE notification_id = $1",
		[notification_id],
		(err) => console.log(err)
	);
}

async function assign_notification_endpoint(user_id) {
	// notification_id BIGSERIAL PRIMARY KEY,
	// user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
	// auth varchar(250),
	// endpointurl varchar(300)

	// connect.pool.query(
	// 	"DELETE FROM notifications WHERE notification_id = $1",
	// 	[notification_id],
	// 	(err) => console.log(err)
	// );
}
module.exports = {
	add_notification: add_notification,
	del_notification: del_notification,
	assign_notification_endpoint:assign_notification_endpoint,
	add_user_endpoint:add_user_endpoint
};

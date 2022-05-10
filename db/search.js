const connect = require("./connect");

async function in_posts(text) {
	const sqltext = "SELECT * FROM posts WHERE header LIKE $1;";
	text = `%${text}%`;
	const values = [text];
	return await connect.run_query_select_rows(sqltext, values);
}

async function in_post_headers(text) {
	const sqltext = "SELECT * FROM posts WHERE body LIKE $1;";
	text = `%${text}%`;
	const values = [text];
	return await connect.run_query_select_rows(sqltext, values);
}

async function in_group_headers(text) {
	const sqltext = "SELECT * FROM groups WHERE group_name LIKE $1;";
	text = `%${text}%`;
	const values = [text];
	return await connect.run_query_select_rows(sqltext, values);
}

module.exports = {
	in_post_headers: in_post_headers,
	in_group_headers: in_group_headers,
	in_posts: in_posts,
};

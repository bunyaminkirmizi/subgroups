/**
 * get comment
 * add comment
 * del comment
 * get comments by post_id
 */




//remove vote if exists
//downvote post
//upvote post

const connect = require('./connect');
const { get_user_by_id } = require('./users');

async function add_comment(owner_id,post_id,text_body) {
	const sqltext = "insert into comment(owner_id,post_id,body,send_timestamp) values($1,$2,$3,current_timestamp);"
	const values = [owner_id,post_id,text_body]
	connect.pool.query(sqltext,values,(err)=>console.log(err))
	}
async function del_comment(comment_id){
	const sqltext = "delete from comment where comment_id = $1;"
	const values = [comment_id]
	connect.pool.query(sqltext,values,(err)=>console.log(err))
}

async function get_comment_by_post(post_id){
	const sqltext = "select * from comment where post_id = $1 order by send_timestamp desc;"
	const values = [post_id]
	let comments = (await connect.pool.query(sqltext,values)).rows
	for (let index = 0; index < comments.length; index++) {
		const element = comments[index];
		element['comment_owner_username'] = (await get_user_by_id(element.owner_id)).username
		
	}
	return comments
}


async function get_comment(comment_id){
	const sqltext = "select * from comment where comment_id = $1;"
	const values = [comment_id]
	connect.pool.query(sqltext,values,(err)=>console.log(err))
}
async function last_comments_by_user(user_id,limit) {
	const sqltext = 'SELECT * FROM comment WHERE owner_id =$1 order by send_timestamp desc limit $2'
	const values = [user_id,limit]
	try {
		return (await connect.pool.query(sqltext, values)).rows
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}
async function user_comment_count(user_id) {
	const sqltext = 'SELECT COUNT(*) FROM comment WHERE owner_id =$1'
	const values = [user_id]
	try {
		return (await connect.pool.query(sqltext, values)).rows[0]
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}
module.exports = {
	get_comment:get_comment,
	add_comment:add_comment,
	del_comment:del_comment,
	get_comment_by_post:get_comment_by_post,
	last_comments_by_user:last_comments_by_user,
	user_comment_count:user_comment_count
}
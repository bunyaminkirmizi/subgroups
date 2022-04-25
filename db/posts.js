//create
//delete
//update


// CREATE TABLE IF NOT EXISTS posts (
// 	post_id BIGSERIAL PRIMARY KEY,
// 	user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
// 	group_id int NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
// 	header varchar(50),
// 	body TEXT NOT NULL,
// 	send_timestamp timestamp
//   );

const { user } = require('pg/lib/defaults');
const connect = require('./connect');
const users = require('./users');
const { get_vote_count } = require('./votes');
const votes = require('./votes');

async function add_post(user_id,group_id,header,body) {
		connect.pool.query(
			"INSERT INTO posts(user_id,group_id,header,body,send_timestamp) values($1,$2,$3,$4,current_timestamp)",
			[user_id,group_id,header,body],
			(err)=>console.log(err))
	}
	
async function update_post(post_id,header,body) {
	const values = [header,body,post_id]
	console.log(values)
	connect.pool.query(
		"UPDATE posts SET header = $1, body = $2 WHERE post_id = $3;",
		values,
		(err)=>console.log(err))
}
async function upvote(user_id,post_id) {
	await votes.upvote(user_id,post_id)
}

async function downvote(user_id,post_id) {
	await votes.downvote(user_id,post_id)
}
	
async function delete_post(post_id) {
	const sqltext = 'DELETE FROM posts WHERE post_id =$1'
	const values = [post_id]
	try {
		await connect.pool.query(sqltext, values)
	  } catch (err) {
		console.log(err.stack)
	  }
	}

async function get_post(post_id) {
	const sqltext = 'SELECT * FROM posts WHERE post_id =$1'
	const values = [post_id]

	try {
		let row = (await connect.pool.query(sqltext, values)).rows[0]
		if(row !=undefined){
			row['votecount'] = await votes.get_vote_count(post_id)
		
		row['sender'] = (await users.get_user_by_id(row.user_id)).username

		}
		return row
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function get_post_with_user_given_vote(post_id,authenticated_user) {
	const sqltext = 'SELECT * FROM posts WHERE post_id =$1'
	const values = [post_id]

	try {
		const res = (await connect.pool.query(sqltext, values))
		if(res == undefined) return undefined;
		let row = res.rows[0]
		if(row !=undefined){
			row['votecount'] = await votes.get_vote_count(post_id)
		const sender_user = (await users.get_user_by_id(row.user_id))
		row['sender'] = sender_user.username
		row['sender_photo'] = sender_user.profile_photo_path

		}
		if (authenticated_user){
			row['user_given_vote'] = await votes.get_vote_type(authenticated_user.user_id, row.post_id)

		}
		return row
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function get_post_for_thumbnail(post_id) {
	const sqltext = 'SELECT * FROM posts WHERE post_id =$1'
	const values = [post_id]
	try {
		return (await connect.pool.query(sqltext, values)).rows[0]
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function get_post_by_group(group_id,authenticated_user,filter) {
	let sqltext = 'SELECT * FROM posts WHERE group_id =$1'
	if(filter){
		if (filter == "up"){
			sqltext =`SELECT 
			groupposts.post_id,groupposts.user_id,groupposts.group_id,groupposts.header,groupposts.body,groupposts.send_timestamp,COALESCE(sum(CASE WHEN vote.vote_type THEN 1 ELSE -1 END),-1)
			FROM 
			(select * from posts where group_id=$1) as groupposts
			LEFT JOIN vote
			ON groupposts.post_id = vote.post_id
			GROUP BY groupposts.post_id,groupposts.user_id,groupposts.group_id,groupposts.header,groupposts.body,groupposts.send_timestamp
			order by coalesce desc;`
		}
		
		if (filter == "down"){
			sqltext =`SELECT 
			groupposts.post_id,groupposts.user_id,groupposts.group_id,groupposts.header,groupposts.body,groupposts.send_timestamp,COALESCE(sum(CASE WHEN vote.vote_type THEN 1 ELSE -1 END),-1)
			FROM 
			(select * from posts where group_id=$1) as groupposts
			LEFT JOIN vote
			ON groupposts.post_id = vote.post_id
			GROUP BY groupposts.post_id,groupposts.user_id,groupposts.group_id,groupposts.header,groupposts.body,groupposts.send_timestamp
			order by coalesce asc;`
		}
		if (filter == "newest"){
			sqltext += " order by send_timestamp desc"
		}
		if (filter == "oldest"){
			sqltext += " order by send_timestamp asc "
		}
	}else{
		sqltext += " order by send_timestamp desc"
	}
	const values = [group_id]
	try {
		const group_posts = (await connect.pool.query(sqltext, values)).rows
		// console.log("rowsss=>",group_posts)
		for (let index = 0; index < group_posts.length; index++) {
			let element = group_posts[index] 
			element['votecount'] = await votes.get_vote_count(element.post_id);
			const senderuser  = (await users.get_user_by_id(element.user_id))
			element['sender'] = senderuser.username
			element['sender_photo'] = senderuser.profile_photo_path
			element['body'] = element['body'].substring(0,605)
			if(authenticated_user){
				element['user_given_vote'] = await votes.get_vote_type(authenticated_user.user_id, element.post_id)
			}
		}

		return group_posts
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function get_post_upvote_count(group_id) {
	const sqltext = 'SELECT * FROM posts WHERE group_id =$1 order by send_timestamp desc'
	const values = [group_id]
	try {
		return (await connect.pool.query(sqltext, values)).rows
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}
	
async function get_post_downvote_count(group_id) {
	const sqltext = 'SELECT * FROM posts WHERE group_id =$1 order by send_timestamp desc'
	const values = [group_id]
	try {
		return (await connect.pool.query(sqltext, values)).rows
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}
async function last_posts_by_user(user_id,limit) {
	const sqltext = 'SELECT * FROM posts WHERE user_id =$1 order by send_timestamp desc limit $2'
	const values = [user_id,limit]
	try {
		return (await connect.pool.query(sqltext, values)).rows
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function user_post_count(user_id) {
	const sqltext = 'SELECT COUNT(*) FROM posts WHERE user_id =$1'
	const values = [user_id]
	try {
		return (await connect.pool.query(sqltext, values)).rows[0]
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function get_user_joined_group_posts(user_id) {
	const sqltext = `SELECT users.username,users.user_id,users.profile_photo_path,userposts.header,userposts.body,userposts.send_timestamp,userposts.post_id from users
	RIGHT JOIN (SELECT *
	FROM (select group_id from group_participants where user_id = $1) as usergroups
	LEFT JOIN posts 
	ON usergroups.group_id = posts.group_id) as userposts
	ON userposts.user_id = users.user_id;`
	const values = [user_id]
	try {
		return (await connect.pool.query(sqltext, values)).rows
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}
async function last_posts_from_public_groups(limit) {
	const sqltext = 'SELECT * FROM posts order by send_timestamp desc limit $1;'
	const values = [limit]
	try {
		return (await connect.pool.query(sqltext, values)).rows
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}
module.exports = {
	delete_post:delete_post,
	update_post:update_post,
	add_post:add_post,
	get_post:get_post,
	get_post_by_group:get_post_by_group,
	upvote:upvote,
	downvote:downvote,
	get_post_with_user_given_vote:get_post_with_user_given_vote,
	last_posts_by_user:last_posts_by_user,
	user_post_count:user_post_count,
	get_user_joined_group_posts:get_user_joined_group_posts,
	last_posts_from_public_groups:last_posts_from_public_groups

}
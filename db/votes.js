//remove vote if exists
//downvote post
//upvote post

const connect = require('./connect');

async function remove_old_vote_if_exists(user_id,post_id) {
	const sqltext = 'delete from vote where user_id =$1 and post_id=$2;'
	const values = [user_id,post_id]
	try {
		(await connect.pool.query(sqltext, values)).rows[0]
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

async function vote(user_id,post_id,type) {
	await remove_old_vote_if_exists(user_id,post_id)
	const sqltext = "insert into vote(user_id,post_id,vote_type,vote_timestamp) values($1,$2,$3,current_timestamp)"
	const values = [user_id,post_id,type]
	connect.pool.query(sqltext,values,(err)=>console.log(err))
	}

async function upvote(user_id,post_id) {
	await vote(user_id,post_id,true)
}
async function downvote(user_id,post_id) {
	await vote(user_id,post_id,false)
}
async function get_vote_type(user_id,post_id){
	const sqltext = "select * from vote where user_id = $1 and post_id=$2"
	const values = [user_id,post_id]
	try {
		const vote = (await connect.pool.query(sqltext, values)).rows[0]
		if(vote){
			return vote.vote_type
		}else{
			return undefined
		} 
		} catch (err) {
		console.log(err.stack)
		}
	return null

}
async function get_vote_count(post_id){
	const sqltext = "select ((select count(*) from vote where post_id=$1 and vote_type=True) - (select count(*) from vote where post_id=$1 and vote_type=False)) as votecount;"
	const values = [post_id]

	try {
		console.log((await connect.pool.query(sqltext, values)).rows[0].votecount)
		return (await connect.pool.query(sqltext, values)).rows[0].votecount
		} catch (err) {
		console.log(err.stack)
		}
	return null
	}

module.exports = {
	downvote:downvote,
	upvote:upvote,
	get_vote_count:get_vote_count,
	get_vote_type:get_vote_type,
	remove_old_vote_if_exists:remove_old_vote_if_exists
}
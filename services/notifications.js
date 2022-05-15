const posts = require('../db/posts')
const groups = require('../db/groups')
async function send_new_post_notification(post_id) {
	const newpost = await posts.get_post(post_id)
	const group_id = newpost.group_id
	const room = `group:${group_id}`

	// post_group_participants.forEach(element => {
	// 	console.log(element, 'is in group')
	// 	//send notification each user
	// });
}

module.exports = {
	send_new_post_notification: send_new_post_notification
}
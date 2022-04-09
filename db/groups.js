/*group actions list
create groups
delete groups
join groups
leave groups
get subgroups
get parent group
*/

const connect = require('./connect');

async function create_group(user_id,group_name) {
	const sqltext="INSERT INTO groups(user_id,group_name) values($1,$2) RETURNING group_id"
	const values = [user_id, group_name]
	let added_group_id = null
	try {
		added_group_id = (await connect.pool.query(sqltext, values)).rows[0].group_id
	  } catch (err) {
		console.log(err.stack)
	  }
	if(added_group_id == null){
		console.log("Err: Group cant be added to database")
		return null
	}
	return added_group_id;
	}

async function create_group_under_parent(user_id,group_name,parent_group_id) {
	const group_id = await create_group(user_id,group_name)
	if(group_id != null){
		make_child(group_id,parent_group_id)
		return group_id;
	}
	return undefined;
	}

async function make_child(group_id,parent_group_id){
	connect.pool.query(
		"INSERT INTO groups_hierarchy(group_id,parent_group_id) values($1,$2)",
		[group_id,parent_group_id],
		(err)=>console.log(err)
		)
	}

function delete_group(group_id) {
	connect.pool.query(
		"DELETE FROM groups	where group_id = $1",
		[group_id],
		(err)=>console.log(err))
	}

function join_group(user_id,group_id) {
	connect.pool.query(
		"INSERT INTO group_participants(group_id,user_id) values($1,$2)",
		[group_id,user_id],
		(err)=>console.log(err)
		)
	}

function leave_group(user_id,group_id) {
	connect.pool.query(
		"DELETE FROM group_participants WHERE group_id=$1 AND user_id =  $2",
		[group_id,user_id],
		(err)=>console.log(err)
		)
	}
async function get_group(group_id) {
	let group = null
	const sqltext = 'select group_id, group_name from groups where group_id=$1;'
	const values = [group_id]
	try {
		group = (await connect.pool.query(sqltext, values)).rows[0];
		return group
		} catch (err) {
		console.log(err.stack)
		}
		console.log(group,"got from database")
	return group;
	}

async function get_subs(group_id) {
	let groups = []
	const sqltext = 'select groups.group_id, groups.group_name from groups right join groups_hierarchy on groups.group_id=groups_hierarchy.group_id where parent_group_id=$1;'
	const values = [group_id]
	try {
		(await connect.pool.query(sqltext, values)).rows.forEach(element => {
			groups.push( element)
		});
		// console.log("grupssss", groups);
		return groups
	  } catch (err) {
		console.log(err.stack)
	  }
	  console.log(groups,"got from database")
	return groups;
	}

async function get_parent(group_id) {
	var user = null
	const sqltext = 'select parent_group from groups_hierarchy where group_id=$1'
	const values = [group_id]
	try {
		user = (await connect.pool.query(sqltext, values)).rows[0]
	  } catch (err) {
		console.log(err.stack)
	  }
	  console.log(user,"got from database")
	return user;
	}
function make_group_public(user_id,group_id) {
	return null
	}
function make_group_private(user_id,group_id) {
	return null
	}

module.exports = {
	create_group:create_group,
	delete_group:delete_group,
	join_group:join_group,
	leave_group:leave_group,
	make_child:make_child,
	create_group_under_parent:create_group_under_parent,
	get_subs:get_subs,
	get_group:get_group
}
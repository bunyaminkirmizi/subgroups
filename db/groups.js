/*
group actions list
create groups
delete groups
join groups
leave groups
is participant check
is owner
get subgroups
get parent group
make private
make public
get status
*/

const connect = require("./connect");
const { TreeNode } = require("./tree");
// const tree = require('./tree');

async function create_group(user_id, group_name) {
	const sqltext =
		"INSERT INTO groups(user_id,group_name,group_create_timestamp) values($1,$2,current_timestamp) RETURNING group_id";

	const values = [user_id, group_name];
	let added_group_id = null;
	try {
		added_group_id = (await connect.pool.query(sqltext, values)).rows[0]
			.group_id;
		join_group(user_id, added_group_id);
	} catch (err) {
		console.log(err.stack);
	}
	if (added_group_id == null) {
		console.log("Err: Group cant be added to database");
		return null;
	}
	return added_group_id;
}

async function recursive_group_traverse(group_id, tree) {
	console.log(group_id);
	let subs = [];
	try {
		subs = await get_subs(group_id);
	} catch (e) {
		return;
	}
	if (subs.length == 0) {
		return;
	}
	for (let index = 0; index < subs.length; index++) {
		const element = subs[index];
		let newchild = new TreeNode(element.group_id, element.group_name);
		tree.add_child(newchild);
		await recursive_group_traverse(element.group_id, newchild);
	}
	tree.id = group_id;
	tree.name = (await get_group(group_id)).group_name;
	return tree;
}

async function create_group_under_parent(user_id, group_name, parent_group_id) {
	const group_id = await create_group(user_id, group_name);
	if (group_id != null) {
		make_child(group_id, parent_group_id);
		return group_id;
	}
	return undefined;
}

async function make_child(group_id, parent_group_id) {
	connect.pool.query(
		"INSERT INTO groups_hierarchy(group_id,parent_group_id) values($1,$2)",
		[group_id, parent_group_id],
		(err) => console.log(err)
	);
}

function delete_group(group_id) {
	connect.pool.query(
		"delete from groups_hierarchy where group_id = $1",

		[group_id],
		(err) => console.log(err)
	);

	connect.pool.query(
		"DELETE FROM groups	where group_id = $1",

		[group_id],
		(err) => console.log(err)
	);
}

async function join_group(user_id, group_id) {
	await connect.pool.query(
		"INSERT INTO group_participants(user_id,group_id) values($1,$2)",
		[user_id, group_id],
		(err) => console.log(err)
	);
}

async function leave_group(user_id, group_id) {
	connect.pool.query(
		"DELETE FROM group_participants WHERE user_id =  $1 AND group_id=$2",
		[user_id, group_id],
		(err) => console.log(err)
	);
}
async function is_owner(user_id, group_id) {
	try {
		const grp = await get_group(group_id);
		console.log("owner", grp.user_id);
		if (grp.user_id == user_id) return true;
		return false;
	} catch {
		console.log("err while is owner database check");
		return false;
	}
}
async function is_participant(user_id, group_id) {
	const sqltext =
		"SELECT * FROM group_participants where user_id=$1  and  group_id = $2";
	const values = [user_id, group_id];
	try {
		const db_response = (await connect.pool.query(sqltext, values)).rows[0];
		console.log("db_response=>", db_response);
		if (db_response != undefined) {
			return true;
		}
		return false;
	} catch (err) {
		console.log(err.stack);
		return false;
	}
}

async function get_group(group_id) {
	let group = null;
	const sqltext =
		"select group_id, group_name,user_id,bannerfilename,group_info from groups where group_id=$1;";
	const values = [group_id];
	try {
		group = (await connect.pool.query(sqltext, values)).rows[0];
		return group;
	} catch (err) {
		console.log(err.stack);
	}
	console.log(group, "got from database");
	return group;
}

async function get_subs(group_id) {
	let groups = [];
	const sqltext =
		"select groups.group_id, groups.group_name from groups right join groups_hierarchy on groups.group_id=groups_hierarchy.group_id where parent_group_id=$1;";
	const values = [group_id];
	try {
		(await connect.pool.query(sqltext, values)).rows.forEach((element) => {
			groups.push(element);
		});
		return groups;
	} catch (err) {
		console.log(err.stack);
	}
	console.log(groups, "got from database");
	return groups;
}

async function get_parent(group_id) {
	const sqltext =
		"select parent_group_id from groups_hierarchy where group_id=$1";
	const values = [group_id];
	try {
		const parent = (await connect.pool.query(sqltext, values)).rows[0];
		return parent;
	} catch (err) {
		return null;
	}
}
async function get_parents(group_id, parents) {
	const sqltext =
		"select parent_group_id from groups_hierarchy where group_id=$1";
	const values = [group_id];
	console.log("parentssss==>", parents);
	try {
		const parent_id = (await connect.pool.query(sqltext, values)).rows[0]
			.parent_group_id;
		if (parent_id == 1) {
			parents.push({
				name: (await get_group(parent_id)).group_name,
				id: parent_id,
			});
			return parents;
		}

		parents.push({
			name: (await get_group(parent_id)).group_name,
			id: parent_id,
		});
		return get_parents(parent_id, parents);
	} catch (err) {
		return parents;
	}
}

function make_group_public(group_id) {
	const sqltext = "UPDATE groups SET is_public = TRUE WHERE group_id = $1;";
	const values = [group_id];
	connect.pool.query(sqltext, values, (err) => console.log(err));
}

function make_group_private(group_id) {
	const sqltext = "UPDATE groups SET is_public = FALSE WHERE group_id = $1;";
	const values = [group_id];
	connect.pool.query(sqltext, values, (err) => console.log(err));
}
async function get_status(group_id) {
	const sqltext = "SELECT is_public from groups where group_id = $1";
	// const sqltext = "UPDATE groups SET is_public = FALSE WHERE group_id = $1;"
	const values = [group_id];
	return (await connect.pool.query(sqltext, values)).rows[0].is_public;
}

function add_banner(group_id, banner_filename) {
	const sqltext = "UPDATE groups SET bannerfilename = $2 WHERE group_id = $1;";
	const values = [group_id, banner_filename];
	connect.pool.query(sqltext, values, (err) => console.log(err));
}

function add_info(group_id, info_text) {
	const sqltext = "UPDATE groups SET group_info = $2 WHERE group_id = $1;";
	const values = [group_id, info_text];
	connect.pool.query(sqltext, values, (err) => console.log(err));
}

function del_banner(group_id) {
	add_banner(group_id, "");
}

function del_info(group_id) {
	add_info(group_id, "");
}

async function get_user_participant_groups(user_id) {
	const sqltext = `SELECT *
	FROM (select * from group_participants where user_id = $1) as usergroups
	LEFT JOIN groups
	ON usergroups.group_id = groups.group_id;`;
	const values = [user_id];
	return (await connect.pool.query(sqltext, values)).rows;
}

async function get_user_owned_groups(user_id) {
	const sqltext = `SELECT *
	FROM groups
	where user_id = $1;`;
	const values = [user_id];
	return (await connect.pool.query(sqltext, values)).rows;
}
async function new_groups(limit) {
	const sqltext = `select * from groups WHERE group_create_timestamp > current_date - interval '7 days' limit $1;`;
	const values = [limit];
	return (await connect.pool.query(sqltext, values)).rows;
}
module.exports = {
	create_group: create_group,
	delete_group: delete_group,
	join_group: join_group,
	leave_group: leave_group,
	make_child: make_child,
	create_group_under_parent: create_group_under_parent,
	get_subs: get_subs,
	is_participant: is_participant,
	get_group: get_group,
	get_parents: get_parents,
	is_owner: is_owner,
	recursive_group_traverse: recursive_group_traverse,
	get_parent: get_parent,
	make_group_public: make_group_public,
	make_group_private: make_group_private,
	get_status: get_status,
	add_banner: add_banner,
	add_info: add_info,
	del_baner: del_banner,
	del_info: del_info,
	get_user_participant_groups: get_user_participant_groups,
	get_user_owned_groups: get_user_owned_groups,
	new_groups: new_groups,
};

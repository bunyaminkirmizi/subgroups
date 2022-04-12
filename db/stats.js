const connect = require("./connect");

async function getcountsql(query){
	try {
		const res = (await connect.run_query_select_first_row(query,[]))
		return res.count;
	}catch (err) {
		console.error(err.stack)
		return err.stack;
	}
}

async function lastweekpostspostedcount(){
	const sqltext = `select count(*) from posts WHERE send_timestamp > current_date - interval '7 days';`
	return await getcountsql(sqltext);
}

function lastweekvotesusecount(){
	// TODO: IN ORDER TO GET VOTES BY TIMESTAMP ADD VOTE TIMESTAMP TO DATABASE 
	const SQLtext = `select count(*) from votes WHERE vote_timestamp > current_date - interval '7 days';`

	return '0000'
}
async function lastweekgroupcreationcount(){
	const SQLtext = `select count(*) from groups WHERE group_create_timestamp > current_date - interval '7 days';`
	return await getcountsql(SQLtext);
}
async function lastweekregistercount(){
	const SQLtext = `select count(*) from users WHERE register_timestamp > current_date - interval '7 days';`
	return await getcountsql(SQLtext);
}
async function mostvotedpost(){
	const SQLtext = `
	SELECT posts.post_id,posts.header,count(upvotes)
	FROM posts
	RIGHT JOIN (SELECT * FROM vote WHERE vote_type=true) as upvotes
	ON posts.post_id = upvotes.post_id
	group by posts.post_id
	order by count desc limit 1;`;
	try {
		const res = (await connect.run_query_select_first_row(SQLtext,[]))
		console.log(res)
		return res;
	}catch (err) {
		console.error(err.stack)
		return err.stack;
	}
}
function activegroup(){
	return 'dddactivegroupddd';
}

function populargroups(){
	return [{id:4,name:'populargroup1'},{id:4,name:'populargroup1'},{id:5,name:'populargroup5'},{id:6,name:'populargroup5'},{id:7,name:'populargroup4'}];
}

async function mostupvotedposts(){
	const SQLtext = `
	SELECT posts.post_id,posts.header,count(upvotes)
	FROM posts
	RIGHT JOIN (SELECT * FROM vote WHERE vote_type=true) as upvotes
	ON posts.post_id = upvotes.post_id
	group by posts.post_id
	order by count desc limit 5;`
	return await connect.run_query_select_rows(SQLtext,[]);
}

async function last_week(){
		return {
			registered: await lastweekregistercount(),
			posted: await  lastweekpostspostedcount(),
			usedvotes: await  lastweekvotesusecount(),
			newgroups: await  lastweekgroupcreationcount(),
			mostvoted: await  mostvotedpost(),
			activegroup: await  activegroup(),
			populargroups: await  populargroups(),
			mostupvotedposts: await  mostupvotedposts()
		}
	}

module.exports.lastweek = last_week
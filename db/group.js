db = require("./connection");

async function add(parent_group, name) {
  return await db.pool.query(
    "INSERT INTO groups (parent_group, name) VALUES (?, ?);",
    [parent_group, name]
  );
}

async function get(id) {
  return (await db.pool.query("SELECT * FROM groups where id = ?", id))[0];
}

async function get_by_name(name) {
  return (await db.pool.query("SELECT * FROM groups where name = ?", name))[0];
}

async function get_group_dropdown(id) {
  const groupinfo = await get(id);
  const subgroups = await db.pool.query(
    "SELECT * FROM groups where parent_group = ?",
    id
  );
  delete subgroups.meta;
  const groupdropdown = {
    groupname: groupinfo.name,
    parent_group: groupinfo.parent_group,
    subgroups: subgroups,
  };
  console.log(groupdropdown);
  return groupdropdown;
}

async function get_group_dropdown_by_name(name) {
  const group = (
    await db.pool.query("SELECT id FROM groups where name = ?", name)
  )[0];
  return await get_group_dropdown(group.id);
}
module.exports = {
  add,
  get_group_dropdown,
  get_group_dropdown_by_name,
  get,
  get_by_name,
};

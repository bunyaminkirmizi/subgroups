class TreeNode {
	constructor(id,name) {
	  this.id = id;
	  this.name = name;
	  this.descendants = [];
	}

	add_child = (child) =>{
		this.descendants.push(child)
	}

  }

class Tree{
	constructor(root) {
		this.root = root;
		this.descendants = [];
	  }
}
	
module.exports = {
	TreeNode:TreeNode,
	Tree:Tree
}
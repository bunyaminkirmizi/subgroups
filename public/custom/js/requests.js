function change_vote(post,count) {
	document.getElementById("vc"+post).innerHTML = count
	
}
async function givevote(post,vote) {
	const response = await fetch(window.location.origin + '/post/vote?post_id='+post+'&vote='+vote) 
	if (response.redirected == true){
		window.location.replace(response.url);
	}else{
		const response_as_json = await response.json();
		// console.log(response_as_json)
		const new_vote_info = response_as_json
		if(new_vote_info.user_vote == true){
			document.getElementById("arrowup"+post).classList.add("upvoted")
			document.getElementById("arrowdown"+post).classList.remove("downvoted")
			

		}else if(new_vote_info.user_vote == false){
			document.getElementById("arrowup"+post).classList.remove("upvoted")
			document.getElementById("arrowdown"+post).classList.add("downvoted")

		}else if(new_vote_info.user_vote == undefined){
			document.getElementById("arrowup"+post).classList.remove("upvoted")
			document.getElementById("arrowdown"+post).classList.remove("downvoted")
		}
		change_vote(post,new_vote_info.vote_count)
	}
}

function giveupvote(post) {
	givevote(post,'up')
}

function givedownvote(post) {
	givevote(post,'down')
}

let uploadedfiles =[]
function addphotototextarea (nameofphoto,url) {
	console.log(url)
	if (!uploadedfiles.includes(url)) uploadedfiles.push(url);
	const imgs = document.getElementById('images')
	imgs.value = uploadedfiles
	simplemde.value(simplemde.value() + `![${nameofphoto}](${url})`)
}
async function uploadfile() {
	let input = document.getElementById('myFile')
	let data = new FormData()
	data.append('filename', input.files[0])

	if(input.files[0].size > 10097152){
		alert("Dosya boyutu büyük!");
		console.log("Big file so can't upload")
		input.value = "";
		return
	 };
	let url = '/upload/'+input.files[0].name;
	try {
		let response = await fetch(url, {
			method: 'POST',
			body: data
			
			})
		const response_as_json = await response.json();
		let showfiles = document.getElementById("uploaded_files")
		function newtext(name,url_of_photo) {
			return `<div class="row mb-2">
    <div class="col-sm">${name}</div>
    <div class="col-sm"><button onclick="addphotototextarea('${name}','${url_of_photo}')" class="btn btn-primary">bu resmi ekle</button></div>
  				</div>`
		}
		showfiles.innerHTML = showfiles.innerHTML + newtext(response_as_json.filename,response_as_json.filepath)

		console.log("response as json: ",response_as_json);
		return response;
	} catch (e) {
		console.log("ERROR=>",e.message)

		return e.message;
}

}

var myfileee=document.getElementById("myFile")
if (myfileee){
	try{
		myfileee.addEventListener('change',() => {
	
			console.log(document.getElementById("myFile").files[0])
			uploadfile()
		})
	}catch (e){
		console.log(e);
	}
	
}


function recursive_group_traverse(tree,nextnode) {
	if(tree== undefined){
		console.log("undefined tree")
	}
	if(tree.descendants == undefined){
		return;
	}
	console.log(tree.id);
	let subs = tree.descendants;
    console.log("subs",subs)
	
	
	const li = document.createElement('li');
	const code = document.createElement('code')
	const stretchedlink = document.createElement('a')
	stretchedlink.classList.add('stretched-link')
	stretchedlink.href = '/group/'+tree.id
	// buttonlink.href='/group/'+tree.id
	// buttonlink.innerHTML=tree.name
	// code.appendChild(buttonlink)

	code.innerHTML= tree.name
	li.appendChild(code)
	code.appendChild(stretchedlink)
	nextnode.appendChild(li)
	const htmlelement = document.createElement('ul');
	li.appendChild(htmlelement)
	for (let index = 0; index < subs.length; index++) {
		const element = subs[index];
		console.log("element",element);
		
		
		recursive_group_traverse(element,htmlelement) ;
	}
	console.log("id=>",tree.id);
	console.log("name=>",tree.name);
	return tree;
	}

var rootnode = document.getElementById("rootnodetree")
try{
	if(tree){
		recursive_group_traverse(tree,rootnode)
	}
}catch(e){
	console.log(e)
}




let a ={}
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

async function uploadfile() {
	let input = document.getElementById('myFile')
	let data = new FormData()
	data.append('filename', input.files[0])

	let url = '/upload/'+input.files[0].name;
	console.log("tesfdaadsfdsfasdfasdgadsgdsfs");
	try {
		let response = await fetch(url, {
			method: 'POST',
			body: data
			})
		const response_as_json = await response.json();
		let files = document.getElementById("uploaded_files")
		var text = document.createTextNode(response_as_json['filepath']);

		files.appendChild(text)
		console.log("response as json: ",response_as_json);
		return response;
	} catch (e) {
		console.log("eeeeeeeeeeeeeer",e.message)

		return e.message;
}

}


document.getElementById("myFile").addEventListener('change',() => {
	
	console.log(document.getElementById("myFile").files[0])
	uploadfile()
})


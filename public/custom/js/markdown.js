
var editor = document.getElementById("editor")
if (editor){
	try{
		var simplemde = new SimpleMDE({ element: editor });
	}catch(e){
		console.log(e);
	}
	
}
var mdtext = document.getElementById('markdown_detailed_text')
if(mdtext){
	mdtext.innerHTML = marked.parse(document.getElementById('markdown_detailed_text').innerHTML);
	try{
		mdtext.querySelectorAll("img").forEach(element => {
			console.log(element.classList.add("card-img"));
		});
	}catch (e){
		console.log(e)
	}
	
}

var mdtextlist = document.getElementsByClassName('markdown_detailed_render')
if(mdtextlist){
	try{
		for(let i=0;i<mdtextlist.length;i++){
			const element = mdtextlist[i];
			element.innerHTML = marked.parse(element.innerHTML);
			element.querySelectorAll("img").forEach(element => {
				console.log(element.classList.add("card-img"));
			});
		}
	}catch(e){
		console.log(e)
	}
	
}


var codemrr = document.getElementsByClassName('CodeMirror')
if(codemrr){
	try{
		if(codemrr[0]){
			codemrr[0].classList.add('mt-0')
		}
		
	}catch(e){
		console.log(e)
	}
	
}

//thumnail process
for (let i of document.getElementsByClassName('textthumbnail')) {
    const thumbnailpostid = i.getElementsByTagName('a')[0].id
    const d = i.parentNode.getElementsByClassName('thumbnailpost')[0]
	// const obj = i.parentNode.getElementsByClassName('obj')[0]
    var list =i.getElementsByTagName('img')
    for (var s = list.length-1; s >= 0; s--) {
        // console.log(s,list[s]); //second console output
        d.src = list[s].src
		// obj.data = list[s].src
        list[s].remove()
    }
}
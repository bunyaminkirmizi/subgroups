var simplemde = new SimpleMDE({ element: document.getElementById("editor") });

var mdtext = document.getElementById('markdown_detailed_text')
if(mdtext){
	mdtext.innerHTML = marked.parse(document.getElementById('markdown_detailed_text').innerHTML);
	mdtext.querySelectorAll("img").forEach(element => {
		console.log(element.classList.add("card-img"));
	});
}

document.getElementsByClassName('CodeMirror')[0].classList.add('mt-0')
var simplemde = new SimpleMDE({ element: document.getElementById("editor") });

document.getElementById('markdown_detailed_text').innerHTML = marked.parse(document.getElementById('markdown_detailed_text').innerHTML);
document.getElementById('markdown_detailed_text').querySelectorAll("img").forEach(element => {
	console.log(element.classList.add("card-img"));
});


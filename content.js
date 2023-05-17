const html = document.querySelector("html");
let isEdit = false;
let raw = "";

let metadata = {};

async function setup() {
    // only run the code if the page is webish
    if(html.hasAttribute("data-type") && html.getAttribute("data-type") === "webish") {

        const body = document.querySelector("article");
        body.innerHTML = "<h1>Webish article</h1>";

        const metaTags = document.getElementsByTagName("meta");

        for (let i = 0; i < metaTags.length; i++) {
            const tag = metaTags[i];
            metadata[tag.getAttribute("name")] = tag.getAttribute("content");
        }
        const url = `https://api.github.com/repos/${metadata.owner}/${metadata.repo}/contents`;
       
        const response = await fetch(url);
        const nav = createNavigation(await response.json());

        if(doesUserHavePermissionsToEdit()) {
            createEditMenu();
        }
    }
}

function createEditMenu() {
    // get the aside element
    const aside = document.querySelector("aside");
    // create the edit menu
    const editMenu = document.createElement("div");
    editMenu.classList.add("edit-menu");
    // create the edit button
    const editButton = document.createElement("button");
    editButton.innerText = "Edit";


    editButton.addEventListener("click", () => {
        editMenu.classList.toggle("show");
        isEdit = !isEdit;

        if(isEdit) {
            editButton.innerText = "Save";

            // set the article to be the value in raw
            const article = document.querySelector("article");
            article.innerText = raw;

            // set the article to be editable
            article.setAttribute("contenteditable", true);
            article.focus();
        }   
        else {




            editButton.innerText = "Edit";
        }
    });

    // insert editMenu into aside
    aside.appendChild(editMenu);
    // insert editButton into editMenu
    editMenu.appendChild(editButton);
   
}


async function saveArticle() {
    
}

async function doesUserHavePermissionsToEdit() {
    const url = `https://api.github.com/repos/${metadata.owner}/${metadata.repo}/collaborators/${metadata.username}/permission`;
    const response = await fetch(url);
    const data = await response.json();
    return data.permission === "admin" || data.permission === "write";
}


async function loadFile(fileName) {
    // load the file from github
    const url = `https://raw.githubusercontent.com/${metadata.owner}/${metadata.repo}/master/${fileName}`;
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

async function displayFile(fileName) {
    raw = await loadFile(fileName);
    const article = document.querySelector("article");
    
    // convert to html using showdown.js
    const converter = new showdown.Converter();
    article.innerHTML = converter.makeHtml(raw);


    console.log("display file...");
    console.log(raw);
    
    

}

async function createNavigation(data) {

    const navElement = document.getElementsByTagName("nav")[0];
    data.forEach(data => {
        // check if the file is a markdown file
        const file = data.name;
        const fileExtension = file.split(".").pop();
        
        if(fileExtension === "md") {
            const li = document.createElement("li");
            const a = document.createElement("a");
            // get the name of the file without the extension
            const fileName = file.split(".").slice(0, -1).join(".");

            a.addEventListener("click", () => {
                displayFile(file);
            });
            
            a.innerText = fileName;
            li.appendChild(a);
            navElement.appendChild(li);
        }
    });
    const ul = document.createElement("ul");
    navElement.appendChild(ul);
    



}



setup();



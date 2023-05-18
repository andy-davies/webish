const html = document.querySelector("html");
let isEdit = false;
let raw = "";

let metadata = {};

async function setup() {
    // only run the code if the page is webish
    if (html.hasAttribute("data-type") && html.getAttribute("data-type") === "webish") {

        const body = document.querySelector("article");

        const metaTags = document.getElementsByTagName("meta");
        for (let i = 0; i < metaTags.length; i++) {
            const tag = metaTags[i];
            metadata[tag.getAttribute("name")] = tag.getAttribute("content");
        }

        const url = `https://api.github.com/repos/${metadata.owner}/${metadata.repo}/contents`;

        const response = await fetch(url);
        const nav = createNavigation(await response.json());

        // load username from extension storage
        metadata.userName = await getSetting();
        metadata.accessToken = await getAccessToken();

        
        if (await doesUserHavePermissionsToEdit()) {
            createEditMenu();
        }
    }
}

async function getSetting() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['userName'], function (result) {
            resolve(result.userName);
        });
    });
}

async function getAccessToken() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['accessToken'], function (result) {
            resolve(result.accessToken);
        });
    });
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

        if (isEdit) {
            editButton.innerText = "Save";

            // set the article to be the value in raw
            const article = document.querySelector("article");
            article.innerText = raw;

            // set the article to be editable
            article.setAttribute("contenteditable", true);
            article.focus();
        }
        else {

            raw = document.querySelector("article").innerText;

            saveArticle();

            editButton.innerText = "Edit";
            renderRaw();
        }
    });

    // insert editMenu into aside
    aside.appendChild(editMenu);
    // insert editButton into editMenu
    editMenu.appendChild(editButton);

}


async function saveArticle() {

    const encoded = btoa(raw);
    console.log(metadata);
    const url = `https://api.github.com/repos/${metadata.owner}/${metadata.repo}/contents/${metadata.file}?access_token=${metadata.token}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `token ${metadata.accessToken}`
        },
        body: JSON.stringify({
            message: "update",
            content: encoded,
            sha: metadata.sha
        })
    });
    const data = await response.json();
    console.log(data);

}

async function doesUserHavePermissionsToEdit() {
    console.log("doesUserHavePermissionsToEdit");
    console.log(metadata);
    const url = `https://api.github.com/repos/${metadata.owner}/${metadata.repo}/collaborators/${metadata.userName}/permission`;
    console.log(url);
    const response = await fetch(url, { headers: { Authorization: `token ${metadata.accessToken}` }});
    const data = await response.json();

    console.log(data);
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
   
    metadata.file = fileName;

    renderRaw();
}

async function renderRaw() {
    const converter = new showdown.Converter();
    const article = document.querySelector("article");
    article.innerHTML = converter.makeHtml(raw);

}

async function createNavigation(data) {

    const navElement = document.getElementsByTagName("nav")[0];
    data.forEach(data => {
        // check if the file is a markdown file
        const file = data.name;
        const fileExtension = file.split(".").pop();

        if (fileExtension === "md") {
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



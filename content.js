const html = document.querySelector("html");

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

        console.log(metadata);

        const url = `https://api.github.com/repos/${metadata.owner}/${metadata.repo}/contents`;
        console.log(url);

        const response = await fetch(url);
        const nav = createNavigation(await response.json());

        // add showdown.js to the page
        // const script = document.createElement("script");
        // script.src = "https://unpkg.com/showdown/dist/showdown.min.js";
        // document.body.appendChild(script);

        // adjust to avoid security policy issues
        // const meta = document.createElement("meta");
        // meta.setAttribute("http-equiv", "Content-Security-Policy");
        // meta.setAttribute("content", "upgrade-insecure-requests");
        // document.head.appendChild(meta);

      
    }
}

async function loadFile(fileName) {
    // load the file from github
    const url = `https://raw.githubusercontent.com/${metadata.owner}/${metadata.repo}/master/${fileName}`;
    const response = await fetch(url);
    const text = await response.text();
    return text;
}

async function displayFile(fileName) {
    const text = await loadFile(fileName);
    const article = document.querySelector("article");
    
    // convert to html using showdown.js
    const converter = new showdown.Converter();
    article.innerHTML = converter.makeHtml(text);

    
    

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
        console.log(file);

       


    });
    const ul = document.createElement("ul");
    navElement.appendChild(ul);
    



}



setup();



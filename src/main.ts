import "../html/index.css";

const _pageElementsIds = {
    "login": "submit-login-btn",
    "signup": "signup-login-btn",
    "accToggleBtn": "acc-toggle-btn",
    "usernameInput": "username-input",
    "passwordInput": "password-input"
}
type PageElementName = keyof typeof _pageElementsIds;

const pageElements = {} as Record<PageElementName, HTMLElement>;

for(const [name, id] of Object.entries(_pageElementsIds)) {
    const el = document.getElementById(id);
    if(el) {
        pageElements[name as PageElementName] = el;
    } else {
        pageElements[name as PageElementName] = document.createElement("button");
        console.error("Button [" + name + "] with ID [" + id + "] was not found.");
    }
}
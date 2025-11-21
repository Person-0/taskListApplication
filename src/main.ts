import "../html/index.css";

const _pageElementsIds = {
    "login": "submit-login-btn",
    "signup": "signup-login-btn",
    "accToggleBtn": "acc-toggle-btn",
    "usernameInput": "username-input",
    "passwordInput": "password-input"
}

type tabName = "login" | "app";
type PageElementName = keyof typeof _pageElementsIds;

const pageElements = {} as Record<PageElementName, HTMLElement>;
for (const [name, id] of Object.entries(_pageElementsIds)) {
    const el = document.getElementById(id);
    if (el) {
        pageElements[name as PageElementName] = el;
    } else {
        pageElements[name as PageElementName] = document.createElement("button");
        console.error("Button [" + name + "] with ID [" + id + "] was not found.");
    }
}

function switchTab(tabName: tabName) {
    const toShowTab = document.querySelector("[tab-name=" + tabName + "]") as HTMLElement;
    if (toShowTab) {
        for (const tab of (document.querySelectorAll(".page-tab") as NodeListOf<HTMLElement>)) {
            tab.style.display = "none";
        }
        toShowTab.style.display = "flex";
    } else {
        console.error("switchTab called with invalid tabName: ", tabName);
    }
}

pageElements.login.onclick = () => {
    switchTab("app");
}

switchTab("login");
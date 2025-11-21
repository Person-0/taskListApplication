import "../html/index.css";

const _pageElementsSelectors = {
    "login": "#submit-login-btn",
    "signup": "#signup-login-btn",
    "accToggleBtn": "#acc-toggle-btn",
    "usernameInput": "#username-input",
    "passwordInput": "#password-input",
    "addTaskBtn": "#add-task-btn",
    "returnToAppBtn": "#return-app-btn",
    "saveTaskBtn": "#save-task-btn",
    "deleteTaskBtn": "#delete-task-btn",
    "taskNameInput": "#task-name-input",
    "taskDetailsInput": "#task-details-textinput",
    "tasksList": ".tasks-list",
    "taskCheckbox": ".task-checkbox",
    "taskInfoDate": ".task-info-date",
    "taskInfoSno": ".task-info-sno"
}

type tabName = "login" | "app" | "task-editor";
type PageElementName = keyof typeof _pageElementsSelectors;

const pageElements = {} as Record<PageElementName, HTMLElement>;
for (const [name, selector] of Object.entries(_pageElementsSelectors)) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
        pageElements[name as PageElementName] = el;
    } else {
        pageElements[name as PageElementName] = document.createElement("button");
        console.error("Button [" + name + "] with selector [" + selector + "] was not found.");
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

pageElements.addTaskBtn.onclick = () => {
    switchTab("task-editor");
}

pageElements.returnToAppBtn.onclick = () => {
    switchTab("app");
}

switchTab("login");
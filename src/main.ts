import { APIClass } from "./api";
import { loadTasks, loadTaskEditor } from "./tasks";
import { toast } from "./toast";

const API = new APIClass();

const _pageElementsSelectors = {
    "login": "#submit-login-btn",
    "signup": "#signup-login-btn",
    "accToggleBtn": "#acc-toggle-btn",
    "usernameInput": "#username-input",
    "passwordInput": "#password-input",
    "addTaskBtn": "#add-task-btn",
    "noTasksDiv": ".no-list-items",
    "returnToAppBtn": "#return-app-btn",
    "saveTaskBtn": "#save-task-btn",
    "deleteTaskBtn": "#delete-task-btn",
    "taskNameInput": "#task-name-input",
    "taskDetailsInput": "#task-details-textinput",
    "tasksList": ".tasks-list",
    "taskCheckbox": ".task-checkbox",
    "taskInfoDate": ".task-info-date",
    "taskInfoSno": ".task-info-sno",
    "toastDisplay": "#toast-display",
    "toastText": "#toast-text"
}

type tabName = "login" | "app" | "task-editor";
type PageElementName = keyof typeof _pageElementsSelectors;
export type pageElementsType = Record<PageElementName, HTMLElement | HTMLInputElement>;

declare global {
    interface Window {
        switchTab: (tabName: string) => void;
        taskView: (sno: number) => void;
        taskDelete: (sno: number) => void;
        taskCheckUpdate: (checkbox: HTMLInputElement, sno: number) => void;
        loadApp(): Promise<void>;
        pageElements: pageElementsType;
    }
}

const pageElements = {} as pageElementsType;
for (const [name, selector] of Object.entries(_pageElementsSelectors)) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
        pageElements[name as PageElementName] = el;
    } else {
        pageElements[name as PageElementName] = document.createElement("button");
        console.error("Button [" + name + "] with selector [" + selector + "] was not found.");
        toast("pageElements were not resolved completely");
    }
}

Object.defineProperty(window, "pageElements", {value: pageElements});
Object.defineProperty(window, "switchTab", {value: switchTab});

function switchTab(tabName: tabName) {
    const toShowTab = document.querySelector("[tab-name=" + tabName + "]") as HTMLElement;
    if (toShowTab) {
        for (const tab of (document.querySelectorAll(".page-tab") as NodeListOf<HTMLElement>)) {
            tab.style.display = "none";
        }
        toShowTab.style.display = "flex";
    } else {
        console.error("switchTab called with invalid tabName: ", tabName);
        toast("switchTab was called with invalid parameters");
    }
}

async function toggleLogin() {
    if(localStorage.getItem("token")) {
        await API.logout();
        localStorage.clear();
    }
    location.href = "/";
}

const authorize = (type: 'login' | 'signup') => async () => {
    const username = (pageElements.usernameInput as HTMLInputElement).value;
    const password = (pageElements.passwordInput as HTMLInputElement).value;
    const response = await API.authorize(username, password, type);
    if (response) {
        if (response.error) {
            console.log("authorize error: ", response.message);
            toast("Auth error: " + response.message);
        } else if (response.token && response.tokenAge) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("tokenExpiry", (Date.now() + parseInt(response.tokenAge)).toString());
            await loadApp();
        } else {
            alert("authorize error: auth token / token age not provided!");
        }
    } else {
        toast("unkown auth error");
    }
}

async function loadApp() {
    pageElements.accToggleBtn.innerHTML = "Logout";
    const response = await API.getMyData();
    if(response.error) {
        console.log("loadApp error: " + response.message);
        toggleLogin();
    } else {
        loadTasks(response);
        switchTab("app");
    }
}
window.loadApp = loadApp;

pageElements.login.onclick = authorize('login');
pageElements.signup.onclick = authorize('signup');
pageElements.accToggleBtn.onclick = toggleLogin;

pageElements.addTaskBtn.onclick = () => {
    loadTaskEditor();
}

pageElements.returnToAppBtn.onclick = () => {
    switchTab("app");
}

if(localStorage.getItem("token")) {
    loadApp();
} else {
    switchTab("login");
}
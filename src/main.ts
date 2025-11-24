import "../html/index.css";
import { ValidatorClass } from "../server/validator";
import { APIClass } from "./api";
import { loadTasks, loadTaskEditor } from "./tasks";

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
    "taskInfoSno": ".task-info-sno"
}

type tabName = "login" | "app" | "task-editor";
type PageElementName = keyof typeof _pageElementsSelectors;
export type pageElementsType = Record<PageElementName, HTMLElement>;

const pageElements = {} as pageElementsType;
for (const [name, selector] of Object.entries(_pageElementsSelectors)) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
        pageElements[name as PageElementName] = el;
    } else {
        pageElements[name as PageElementName] = document.createElement("button");
        console.error("Button [" + name + "] with selector [" + selector + "] was not found.");
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
    }
}

async function toggleLogin() {
    if(localStorage.getItem("token")) {
        await API.logout();
        localStorage.clear();
    }
    location.href = "/";
}

const validator = new ValidatorClass();
const authorize = (type: 'login' | 'signup') => async () => {
    const qparams = new URLSearchParams();

    const authType = type === 'signup' ? '1' : '0';
    qparams.append("authType", authType);

    const username = (pageElements.usernameInput as HTMLInputElement).value;
    if (!(validator.username(username))) {
        return;
    }
    qparams.append("username", username);

    const password = (pageElements.passwordInput as HTMLInputElement).value;
    if (!(validator.password(password))) {
        return;
    }
    qparams.append("password", password);

    const response = await API.authorize(qparams.toString());

    if (response.error) {
        // creds invalid and stuff
        console.log("authorize error: ", response.message);
    } else {
        if (response.token && response.tokenAge) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("tokenExpiry", (Date.now() + parseInt(response.tokenAge)).toString());
            await loadApp();
        } else {
            alert("authorize error: auth token / token age not provided!");
        }
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
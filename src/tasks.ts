import { User } from "../server/queries";
import { pageElementsType } from "./main";
import { APIClass } from "./api";

const API = new APIClass();

interface Task {
    title: string;
    checked: boolean;
    sno: number;
    date: string;
    details: string;
}

let currentlyLoadedTasks: { [sno: string]: Task } = {};

function generateTaskListItem(task: Task) {
    return `
    <div class="list-item list-item-checkbox">
        <input type="checkbox" onchange="window.taskCheckUpdate(this, ${task.sno})" class="item-checkbox" ${task.checked ? "checked" : ""}>
    </div>
    <div class="list-item list-item-sno">${task.sno}.</div>
    <div class="list-item list-item-title">${task.title}</div>
    <div class="list-item list-item-time">${task.date}</div>
    <div class="list-item list-item-action-view" onclick="window.taskView(${task.sno})"><span class="material-symbols-outlined">visibility</span></div>
    <div class="list-item list-item-action-delete" onclick="window.taskDelete(${task.sno})"><span class="material-symbols-outlined">delete</span></div>
    `;
}

window.taskView = function (sno: number) {
    loadTaskEditor(currentlyLoadedTasks[sno]);
}

window.taskDelete = function (sno: number) {
    if (currentlyLoadedTasks[sno]) {
        delete currentlyLoadedTasks[sno];
    }
    updateTasksdata().then(() => location.reload());
}

window.taskCheckUpdate = function (checkbox: HTMLInputElement, sno: number) {
    const isChecked = checkbox.checked;
    currentlyLoadedTasks[sno].checked = isChecked;
    updateTasksdata();
}

async function updateTasksdata() {
    const tasksobject = Object.values(currentlyLoadedTasks);
    const tasksdata = btoa(JSON.stringify(tasksobject));
    const result = await API.setMyTasks(tasksdata);
    if (result.error) {
        alert("Error while updating tasks: " + result.message);
    }
}

export function loadTaskEditor(loadTask: Task | undefined = undefined) {
    const pageElements = window.pageElements;
    let hasBeenSaved = !!loadTask;

    let task = loadTask || {
        date: getDateString(),
        sno: getCurrentSno() + 1,
        title: "",
        checked: false,
        details: ""
    } as Task;

    pageElements.taskInfoDate.innerHTML = task.date;
    let snoString = task.sno.toString();
    if (snoString.length < 10) {
        snoString = "0" + snoString;
    }
    pageElements.taskInfoSno.innerHTML = snoString;

    const titleInput = pageElements.taskNameInput as HTMLInputElement;
    const checkbox = pageElements.taskCheckbox as HTMLInputElement;
    const detailsInput = pageElements.taskDetailsInput as HTMLInputElement;

    titleInput.value = task.title;
    checkbox.checked = task.checked;
    detailsInput.value = task.details;

    titleInput.onchange = () => {
        task.title = titleInput.value;
    }
    detailsInput.onchange = () => {
        task.details = detailsInput.value;
    }
    checkbox.onchange = () => {
        task.checked = checkbox.checked;
    }

    pageElements.saveTaskBtn.onclick = async () => {
        if (titleInput.value.length > 0 && detailsInput.value.length > 0) {
            currentlyLoadedTasks[task.sno] = task;
            await updateTasksdata();
            hasBeenSaved = true;
            await window.loadApp();
        }
    }
    pageElements.deleteTaskBtn.onclick = () => {
        if (hasBeenSaved) {
            window.taskDelete(task.sno);
        }
        window.switchTab("app");
    }

    window.switchTab("task-editor");
}

export function loadTasks(userdata: User) {
    const pageElements = window.pageElements;
    let tasks: Task[];
    try {
        tasks = JSON.parse(atob(userdata.tasksdata));
    } catch (e) {
        tasks = [];
        console.log("Error whle loading tasks: ", e);
    }
    if (tasks.length > 0) {
        pageElements.noTasksDiv.style.display = "none";
        pageElements.tasksList.removeAttribute("style");
        for(const child of Array.from(pageElements.tasksList.children)) {
            if(!child.classList.contains("list-header")){
                child.remove();
            }
        }
        for (const task of tasks) {
            pageElements.tasksList.insertAdjacentHTML("beforeend", generateTaskListItem(task));
            currentlyLoadedTasks[task.sno] = task;
        }
    }
}

function getCurrentSno() {
    return Math.max(
        Math.max(
            ...Object.keys(currentlyLoadedTasks).map(e => parseInt(e))
        ), 0
    );
}

function getDateString() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let year = date.getFullYear().toString().slice(2, 4);
    return [day, month, year].join("/");
}
import { User } from "../server/queries";
import { pageElementsType } from "./main";

interface Task {
    title: string;
    checked: boolean;
    sno: number;
    date: string;
    details: string;
}

let currentlyLoadedTasks: {[sno: number]: Task} = {};

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

Object.defineProperty(window, "taskView", {
    value: function(sno: number) {
        loadTaskEditor(currentlyLoadedTasks[sno]);
    }
})

Object.defineProperty(window, "taskDelete", {
    value: function(sno: number) {
        const task = currentlyLoadedTasks[sno];
        // delete task
        location.reload();
    }
})

Object.defineProperty(window, "taskCheckUpdate", {
    value: function(checkbox: HTMLInputElement, sno: number) {
        const isChecked = checkbox.checked;
        const task = currentlyLoadedTasks[sno];
        // update check prop
    }
})

export function loadTaskEditor(task: Task | undefined = undefined) {
    if(task) {

    } else {

    }
    (window as any).switchTab("task-editor");
}

export function loadTasks(userdata: User) {
    const pageElements = (window as any).pageElements as pageElementsType;
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
        for (const task of tasks) {
            pageElements.tasksList.insertAdjacentHTML("beforeend", generateTaskListItem(task));
            currentlyLoadedTasks[task.sno] = task;
        }
    }
}
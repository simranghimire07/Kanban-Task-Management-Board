import { saveTasks, loadTasks, handleDragstart, handleDragend, handleDragover, handleDrop } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    const columns = document.querySelectorAll('.column');
    const modal = document.querySelector(".confirm-modal");

    loadTasks(columns);

    columns.forEach(column => {
        const addButton = column.querySelector("[data-add]");
        addButton.addEventListener("click", () => addTask(column));
        column.querySelector(".tasks").addEventListener("dragover", handleDragover);
        column.querySelector(".tasks").addEventListener("drop", handleDrop);
        column.querySelector(".tasks").addEventListener("dragend", handleTaskMove);
    });

    modal.querySelector("#cancel").addEventListener("click", () => modal.close());
    modal.addEventListener("submit", handleDeleteTask);

    window.addEventListener("beforeunload", () => saveTasks(columns));
});

const updateSelectColor = (select) => {
    select.classList.remove("priority-select-low", "priority-select-medium", "priority-select-high");

    if (select.value === "Low") {
        select.classList.add("priority-select-low");
    } else if (select.value === "Medium") {
        select.classList.add("priority-select-medium");
    } else if (select.value === "High") {
        select.classList.add("priority-select-high");
    }
};


const addTask = (column) => {
    const tasksContainer = column.querySelector(".tasks");

    const existingBlankTask = [...tasksContainer.children].some(task => {
        const title = task.querySelector("input[type='text']").value.trim();
        const description = task.querySelector("textarea").value.trim();
        return title === "" && description === "";
    });

    if (existingBlankTask) {
        alert("Please fill in the existing blank task before adding a new one.");
        return;
    }

    const newTaskData = {
        id: `TASK-${Date.now()}`,
        title: "",
        description: "",
        dueDate: "",
        status: column.dataset.status,
        priority: "Low",
        assignee: "",
        createdAt: new Date().toISOString(),
    };

    const taskElement = createTask(newTaskData);
    tasksContainer.appendChild(taskElement);
    updateTaskCount(column);
    saveTasks(document.querySelectorAll(".column"));
};

const editTask = (task) => {
    const titleInput = task.querySelector(".task-details input[type='text']");
    const descriptionTextarea = task.querySelector(".task-details textarea");
    
    if (titleInput && descriptionTextarea) {
        titleInput.removeAttribute("readonly");
        descriptionTextarea.removeAttribute("readonly");
        titleInput.focus();
    }
};

export const createTask = (taskData) => {
    const task = document.createElement("div");
    task.className = "task";
    task.id = taskData.id;
    task.draggable = true;
    task.dataset.status = taskData.status;
    task.dataset.createdAt = taskData.createdAt;

    task.innerHTML = `
        <div class="task-title">
            <input type="text" value="${taskData.title}" placeholder="Task title" />
            <i class="fas fa-ellipsis-v project-options"></i>

        </div>
        <div class="task-details">
            <textarea placeholder="Description">${taskData.description}</textarea>
        </div>
        
        <input type="text" value="${taskData.assignee}" placeholder="Assignee to" />

        <hr class="divider" />
        <div class="task-meta">
            <select class="priority-select">
                <option value="Low" ${taskData.priority === "Low" ? "selected" : ""}>Low</option>
                <option value="Medium" ${taskData.priority === "Medium" ? "selected" : ""}>Medium</option>
                <option value="High" ${taskData.priority === "High" ? "selected" : ""}>High</option>
            </select>
            <input type="date" value="${taskData.dueDate}" />
        </div>
        <menu>
            <button data-edit><i class="bi bi-pencil-square"></i></button>
            <button data-delete><i class="bi bi-trash"></i></button>
        </menu>
    `;

    const prioritySelect = task.querySelector(".priority-select");
    updateSelectColor(prioritySelect);
    prioritySelect.addEventListener("change", () => updateSelectColor(prioritySelect));

    task.addEventListener("dragstart", handleDragstart);
    task.addEventListener("dragend", handleDragend);
    task.querySelector("[data-edit]").addEventListener("click", () => editTask(task));
    task.querySelector("[data-delete]").addEventListener("click", () => confirmDelete(task));

    return task;
};

const confirmDelete = (task) => {
    const modal = document.querySelector(".confirm-modal");
    const preview = modal.querySelector(".preview");

    const taskTitleInput = task.querySelector(".task-details input[type='text']");

    preview.innerText = taskTitleInput ? taskTitleInput.value.trim() || "Untitled Task" : "Untitled Task";

    const confirmButton = modal.querySelector("#confirm");
    confirmButton.dataset.taskId = task.id; 

    modal.showModal();
};

const handleDeleteTask = (event) => {
    event.preventDefault();

    const modal = document.querySelector(".confirm-modal");
    const confirmButton = modal.querySelector("#confirm");
    const taskId = confirmButton.dataset.taskId; 

    const taskToDelete = document.getElementById(taskId);
    if (taskToDelete) {
        const column = taskToDelete.closest('.column'); 
        taskToDelete.remove();
        updateTaskCount(column);
        removeTask(taskId);
    }

    modal.close();
};

const removeTask = (taskId) => {
    let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
};

export const updateTaskCount = (column) => {
    const taskCount = column.querySelector(".tasks").children.length;
    column.querySelector(".column-title h2").dataset.tasks = taskCount;
};

const handleTaskMove = () => {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.querySelectorAll('.task').forEach(task => {
            task.dataset.status = column.dataset.status;
        });
    });

    columns.forEach(updateTaskCount);
    saveTasks(columns);
};
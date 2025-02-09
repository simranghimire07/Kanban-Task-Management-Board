import { createTask, updateTaskCount } from './main.js';

export const saveTasks = (columns) => {
    const tasks = [];
    columns.forEach(column => {
        const status = column.dataset.status;
        const taskElements = column.querySelectorAll(".task");

        taskElements.forEach(task => {
            if (!task.id) {
                task.id = `TASK-${Date.now()}`;
            }
            tasks.push({
                id: task.id,
                title: task.querySelector(".task-title input")?.value.trim() || "New Task",
                description: task.querySelector(".task-details textarea")?.value.trim() || "Task description",
                dueDate: task.querySelector(".task-meta input[type='date']")?.value || new Date().toISOString().split("T")[0],
                priority: task.querySelector(".task-meta select")?.value || "Low",
                assignee: task.querySelector("input[placeholder='Assignee to']")?.value.trim() || "",
                createdAt: task.dataset.createdAt || new Date().toISOString(),
                status: status
            });
        });
    });

    localStorage.setItem('todoTasks', JSON.stringify(tasks));
};

export const loadTasks = (columns) => {
    const storedTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];

    storedTasks.forEach(taskData => {
        const column = [...columns].find(col => col.dataset.status === taskData.status);
        if (column) {
            const taskElement = createTask(taskData);
            taskElement.setAttribute("draggable", "true");
            taskElement.setAttribute("id", taskData.id);
            taskElement.addEventListener("dragstart", handleDragstart);
            taskElement.addEventListener("dragend", handleDragend);
            column.querySelector(".tasks").appendChild(taskElement);
        }
    });

    columns.forEach(column => updateTaskCount(column));
};

let draggedTask = null;
let previousColumn = null;

export const handleDragstart = (event) => {
    draggedTask = event.target;
    previousColumn = draggedTask.closest(".column");

    if (!draggedTask) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedTask.id);
    draggedTask.classList.add("dragging");

    setTimeout(() => {
        draggedTask.style.opacity = "0.5";
    }, 0);
};

export const handleDragend = (event) => {
    if (draggedTask) {
        draggedTask.classList.remove("dragging");
        draggedTask.style.opacity = "1";
    }
    draggedTask = null;
    previousColumn = null;
};

export const handleDragover = (event) => {
    event.preventDefault();
    if (!draggedTask) return;

    const dropTarget = event.target.closest(".tasks");
    if (dropTarget && dropTarget !== draggedTask.parentNode) {
        dropTarget.appendChild(draggedTask);
    }
};

export const handleDrop = (event) => {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain");
    draggedTask = document.getElementById(taskId);

    if (!draggedTask) {
        return;
    }

    const dropTarget = event.target.closest(".tasks");
    if (dropTarget) {
        dropTarget.appendChild(draggedTask);

        const newColumn = dropTarget.closest(".column");
        if (newColumn) {
            draggedTask.dataset.status = newColumn.dataset.status;
        }

        if (previousColumn) updateTaskCount(previousColumn);
        updateTaskCount(newColumn);

        saveTasks(document.querySelectorAll(".column"));
    }

    draggedTask.classList.remove("dragging");
    draggedTask.style.opacity = "1";
    draggedTask = null;
};


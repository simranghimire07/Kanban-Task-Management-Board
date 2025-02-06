import { createTask , updateTaskCount} from './main.js';
export const saveTasks = (columns) => {
        const tasks = [];
        columns.forEach(column => {
            const status = column.dataset.status;
            const taskElements = column.querySelectorAll(".task");
            taskElements.forEach(task => {
                tasks.push({
                    id: task.id,
                    title: task.querySelector(".task-title input")?.value || "",  
                    description: task.querySelector(".task-details textarea")?.value || "",  
                    dueDate: task.querySelector(".task-details input[type='date']")?.value || "", 
                    priority: task.querySelector(".task-details select")?.value || "Low", 
                    assignee: task.querySelector(".task-details input[type='text']")?.value || "", 
                    createdAt: task.dataset.createdAt,
                    status: status
                });
            });
        });
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
};
    
export const loadTasks = (columns) => {
        const storedTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
    
        storedTasks.forEach(taskData => {
            const column = Array.from(columns).find(col => col.dataset.status === taskData.status);
            if (column) {
                const taskElement = createTask(taskData);
                column.querySelector(".tasks").appendChild(taskElement);
                updateTaskCount(column);
            }
        });
};
    
export const handleDragstart = (event) => {
        event.dataTransfer.setData("text/plain", event.target.id);
        event.target.classList.add("dragging");
};
    
export const handleDragend = (event) => {
        event.target.classList.remove("dragging");
};
    
export const handleDragover = (event) => {
        event.preventDefault();
        const draggedTask = document.querySelector(".dragging");
        const target = event.target.closest(".task, .tasks");
    
        if (!target || target === draggedTask) return;
    
        if (target.classList.contains("tasks")) {
            const lastTask = target.lastElementChild;
            if (!lastTask) {
                target.appendChild(draggedTask);
            } else {
                const { bottom } = lastTask.getBoundingClientRect();
                event.clientY > bottom && target.appendChild(draggedTask);
            }
        } else {
            const { top, height } = target.getBoundingClientRect();
            const distance = top + height / 2;
    
            if (event.clientY < distance) {
                target.before(draggedTask);
            } else {
                target.after(draggedTask);
            }
        }
};
    
export const handleDrop = (event) => {
        const draggedTask = document.querySelector(".dragging");
        const target = event.target.closest(".tasks");
    
        if (target && draggedTask) {
            target.appendChild(draggedTask);
            saveTasks([target.closest('.column')]);
        }
};
    
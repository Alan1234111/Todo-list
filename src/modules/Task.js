import Ui from "./UI";
import { compareAsc, format } from "date-fns";
import { da, el } from "date-fns/locale";
export default class Task {
  tasks = [
    {
      projectName: "Create To Do App",
      name: "Create CSS",
      dueDate: "2023-02-07",
      priority: "low",
      checked: "true",
    },
    {
      projectName: "Create To Do App",
      name: "Create HTML",
      dueDate: "2023-03-01",
      priority: "low",
      checked: "true",
    },
  ];
  activeProject = "inbox";

  constructor() {
    this.ui = new Ui();
    this.projectName = document.querySelector(".project-name");
    this.projectTaskQuantity = document.querySelector(".project-task-quantity");
    this.buttonTaskAdd = document.querySelector(".button-task-add");
    this.buttonTaskClear = document.querySelector(".button-task-clear");

    this.popupNameActionText = document.querySelector(".popup-name-action p");
    this.popupTaskAction = document.querySelector(".popup-task-action");
    this.popupTaskActionCancel = document.querySelector(".popup-task-event-cancel");

    this.taskToDo = document.querySelector(".task-to-do");
    this.popupForm = document.querySelector(".popup-task-form");

    this.buttonTaskAdd.addEventListener("click", this.toggleAddTask);
    this.buttonTaskClear.addEventListener("click", this.clearCompletedTask);
    this.popupTaskActionCancel.addEventListener("click", this.togglePopupForm);

    this.renderTasks();
    this.renderTasksRemaininig();
  }

  togglePopupForm = () => {
    this.popupTaskAction.classList.toggle("hide");
    this.ui.screenDimming();
  };

  addListenerToForm(listenerToAdd) {
    this.popupForm.addEventListener("submit", listenerToAdd, { once: true });
  }

  toggleAddTask = () => {
    this.togglePopupForm();
    this.popupNameActionText.textContent = "New Task";

    const formTaskName = document.getElementById("task-name");
    const formDueDate = document.getElementById("date");
    const formPriority = document.getElementById("priority");

    formTaskName.value = "";
    formDueDate.value = "";
    formPriority.value = "low";

    this.addListenerToForm(this.createNewTask);
  };

  toggleEditTask = (e) => {
    this.togglePopupForm();
    this.popupNameActionText.textContent = "Edit Task";

    const task = e.target.parentNode;
    const formTaskName = document.getElementById("task-name");
    const formDueDate = document.getElementById("date");
    const formPriority = document.getElementById("priority");

    const taskName = task.querySelector(".task-name");
    const dueDate = task.querySelector(".task-date");
    const priority = task.querySelector(".task-checkbox");

    formTaskName.value = taskName.textContent.replace(/\(([^)]+)\)/, "");
    formDueDate.value = dueDate.textContent;
    formPriority.value = priority.classList[1];

    this.popupForm.addEventListener(
      "submit",
      () => {
        this.editTask(event, task);
      },
      { once: true }
    );
  };

  createTaskContainer(taskName, dueDate, priority, checked, whichProject) {
    const task = document.createElement("div");
    task.classList.add("task");

    const checkbox = document.createElement("input");
    checkbox.addEventListener("change", this.changeChecked);
    checkbox.classList.add("task-checkbox");
    checkbox.classList.add(`${priority}`);
    checkbox.type = "checkbox";
    checkbox.name = "checkbox-task";
    checkbox.id = taskName.toLowerCase().replace(/\s+/g, "");
    checkbox.checked = checked;

    const label = document.createElement("label");
    label.htmlFor = taskName.toLowerCase().replace(/\s+/g, "");

    const name = document.createElement("p");
    name.classList.add("task-name");
    whichProject ? (name.textContent = `${taskName} (${whichProject})`) : (name.textContent = `${taskName}`);

    const date = document.createElement("p");
    date.classList.add("task-date");
    date.textContent = `${dueDate}`;

    const editBtn = document.createElement("button");
    editBtn.classList.add("button-edit");
    editBtn.addEventListener("click", this.toggleEditTask);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("button-delete");
    deleteBtn.addEventListener("click", this.deleteTask);

    label.appendChild(name);
    label.appendChild(date);
    task.appendChild(checkbox);
    task.appendChild(label);
    task.appendChild(editBtn);
    task.appendChild(deleteBtn);

    this.taskToDo.append(task);
  }

  addTaskToArray(activeProject, taskName, dueDate, priority, checked) {
    const task = {
      projectName: activeProject,
      name: taskName,
      dueDate: dueDate,
      priority: priority,
      checked: checked,
    };

    this.tasks.push(task);
  }

  isTaskAlreadyExist(taskName) {
    let isAlreadyExist = false;

    this.tasks.forEach((task) => {
      if (task.name.toLowerCase().replace(/\s+/g, "") == taskName.toLowerCase().replace(/\s+/g, "") && task.projectName.toLowerCase().replace(/\s+/g, "") == this.activeProject.toLowerCase().replace(/\s+/g, "")) {
        isAlreadyExist = true;
      }
    });

    return isAlreadyExist;
  }

  createNewTask = (e) => {
    e.preventDefault();

    if (this.popupNameActionText.textContent == "Edit Task") return;

    const taskName = document.getElementById("task-name").value;
    const dueDate = document.getElementById("date").value;
    const priority = document.getElementById("priority").value;

    if (this.isTaskAlreadyExist(taskName)) return this.addListenerToForm(this.createNewTask);

    this.addTaskToArray(this.activeProject, taskName, dueDate, priority, false);
    this.renderTasks();
    this.togglePopupForm();
    this.renderTasksRemaininig();
  };

  editTask = (e, task) => {
    e.preventDefault();
    if (this.popupNameActionText.textContent == "New Task") return;

    const taskName = task.querySelector(".task-name");
    const editedTaskName = document.getElementById("task-name").value;
    const editedDueDate = document.getElementById("date").value;
    const editedPriority = document.getElementById("priority").value;

    const taskNameToChange = taskName.textContent
      .replace(/\(([^)]+)\)/, "")
      .toLowerCase()
      .replace(/\s+/g, "");

    if (this.activeProject.toLowerCase().replace(/\s+/g, "") == "inbox" || this.activeProject.toLowerCase().replace(/\s+/g, "") == "today" || this.activeProject.toLowerCase().replace(/\s+/g, "") == "thisweek") {
      this.tasks.forEach((task) => {
        if (task.name.toLowerCase().replace(/\s+/g, "") == taskNameToChange) {
          task.name = editedTaskName;
          task.dueDate = editedDueDate;
          task.priority = editedPriority;
        }
      });
    } else {
      this.tasks.forEach((task) => {
        if (task.name.toLowerCase().replace(/\s+/g, "") == taskNameToChange && task.projectName.toLowerCase().replace(/\s+/g, "") == this.activeProject.toLowerCase().replace(/\s+/g, "")) {
          task.name = editedTaskName;
          task.dueDate = editedDueDate;
          task.priority = editedPriority;
        }
      });
    }

    this.renderTasks();
    this.togglePopupForm();
  };

  renderAllTasks() {
    let allTasks = [];

    this.tasks.forEach((task) => {
      allTasks.push(task);
    });

    allTasks.forEach((task) => this.createTaskContainer(task.name, task.dueDate, task.priority, task.checked, task.projectName));
    this.renderTasksRemaininig();
  }

  renderAllTodaysTasks() {
    let todayTasks = [];

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    month >= 10 ? (month = date.getMonth() + 1) : (month = `0${date.getMonth() + 1}`);
    day >= 10 ? (day = date.getDate()) : (day = `0${date.getDate()}`);

    let todayDate = `${year}-${month}-${day}`;

    this.tasks.forEach((task) => {
      if (task.dueDate == todayDate) {
        todayTasks.push(task);
      }
    });

    todayTasks.forEach((todayTask) => this.createTaskContainer(todayTask.name, todayTask.dueDate, todayTask.priority, todayTask.checked, todayTask.projectName));
    this.renderTasksRemaininig();
  }

  getLastDay(year, month) {
    return new Date(year, month, 0).getDate();
  }

  renderAllWeeksTasks() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let thisWeekTasks = [];
    let thisWeekDatesTasks = [];

    for (let i = 0; i < 7; i++) {
      if (this.getLastDay(year, month) == day) {
        day = 1;
        month += 1;
      }

      if (Number(month) > 12) {
        month = 1;
        year += 1;
      }

      day >= 10 ? (day = Number(day)) : (day = `0${Number(day)}`);
      month >= 10 ? (month = Number(month)) : (month = `0${Number(month)}`);
      let thisWeekDate = `${year}-${month}-${day}`;
      thisWeekDatesTasks.push(thisWeekDate);

      day = Number(day) + 1;
    }

    thisWeekDatesTasks.forEach((weekTask) => {
      this.tasks.forEach((task) => {
        if (task.dueDate == weekTask) {
          thisWeekTasks.push(task);
        }
      });
    });

    thisWeekTasks.forEach((thisWeekTask) => this.createTaskContainer(thisWeekTask.name, thisWeekTask.dueDate, thisWeekTask.priority, thisWeekTask.checked, thisWeekTask.projectName));
    this.renderTasksRemaininig();
  }

  renderTasks() {
    this.taskToDo.innerHTML = "";
    this.projectName.textContent = this.activeProject;

    if (this.activeProject.toLowerCase().replace(/\s+/g, "") == "inbox") return this.renderAllTasks();
    if (this.activeProject.toLowerCase().replace(/\s+/g, "") == "today") return this.renderAllTodaysTasks();
    if (this.activeProject.toLowerCase().replace(/\s+/g, "") == "thisweek") return this.renderAllWeeksTasks();

    let activeProjectTask = [];

    this.tasks.forEach((task) => {
      if (task.projectName.toLowerCase().replace(/\s+/g, "") == this.activeProject.toLowerCase().replace(/\s+/g, "")) {
        activeProjectTask.push(task);
      }
    });

    activeProjectTask.forEach((activeTask) => this.createTaskContainer(activeTask.name, activeTask.dueDate, activeTask.priority, activeTask.checked));
    this.renderTasksRemaininig();
  }

  changeChecked = (e) => {
    const taskName = e.target.parentNode.querySelector(".task-name").textContent;

    const taskNameWithoutSpaces = taskName
      .replace(/\(([^)]+)\)/, "")
      .toLowerCase()
      .replace(/\s+/g, "");
    const activeProjectWithoutSpaces = this.activeProject.toLowerCase().replace(/\s+/g, "");

    this.tasks.forEach((task) => {
      if (task.name.toLowerCase().replace(/\s+/g, "") == taskNameWithoutSpaces && activeProjectWithoutSpaces == task.projectName.toLowerCase().replace(/\s+/g, "")) {
        task.checked = !task.checked;
      }
    });

    this.renderTasksRemaininig();
  };

  removeAllTaskFromProject(removeProject) {
    this.tasks.forEach((removeTask) => {
      if (removeTask.projectName.toLowerCase().replace(/\s+/g, "") == removeProject.toLowerCase().replace(/\s+/g, "")) {
        const deleteTasksIndex = this.tasks.findIndex((taskIndex) => taskIndex.projectName.toLowerCase().replace(/\s+/g, "") == removeProject.toLowerCase().replace(/\s+/g, ""));
        this.tasks.splice(deleteTasksIndex, 1);
      }
    });

    this.activeProject = "inbox";
    this.renderTasks();
  }

  deleteTask = (e) => {
    const taskName = e.target.parentNode.querySelector(".task-name").textContent;
    const taskDeleteIndex = this.tasks.findIndex((task) => task.name == taskName);

    this.tasks.splice(taskDeleteIndex, 1);
    e.target.parentNode.remove();
    this.renderTasksRemaininig();
  };

  renderTasksRemaininig = () => {
    const numberOfTasks = this.taskToDo.querySelectorAll(`.task input[name="checkbox-task"]:not(:checked)`).length;
    this.projectTaskQuantity.textContent = numberOfTasks;
  };

  clearCompletedTask = () => {
    let completeTasks = [];

    const completedTasksCheckboxes = this.taskToDo.querySelectorAll(`.task input[name="checkbox-task"]:checked`);
    completedTasksCheckboxes.forEach((completeTaskcheckbox) => completeTasks.push(completeTaskcheckbox.closest(".task")));

    completeTasks.forEach((completeTask) => {
      const taskName = completeTask.querySelector(".task-name").textContent;
      const taskDeleteIndex = this.tasks.findIndex((task) => task.name == taskName);
      this.tasks.splice(taskDeleteIndex, 1);
      completeTask.remove();
    });
  };
}

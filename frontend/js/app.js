// Main Application Logic

// Global state
let currentUser = null;
let currentTasks = [];
let currentCategories = [];
let currentFilter = {};
let editingTask = null;

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

// App initialization
function initializeApp() {
  console.log("Initializing Task Management App...");

  // Check authentication
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");

  if (token && username) {
    currentUser = { username };
    api.setToken(token);
    showApp();
    loadAppData();
  } else {
    showAuthModal();
  }

  // Set up event listeners
  setupEventListeners();
}

// Event listeners setup
function setupEventListeners() {
  // Auth form
  document.getElementById("auth-form").addEventListener("submit", handleAuth);

  // Task form
  document
    .getElementById("task-form")
    .addEventListener("submit", handleTaskSubmit);

  // Category form
  document
    .getElementById("category-form")
    .addEventListener("submit", handleCategorySubmit);

  // Search input
  document
    .getElementById("search-input")
    .addEventListener("input", debounce(handleSearch, 300));

  // Sidebar toggle for mobile
  window.addEventListener("resize", handleResize);

  // Close modals when clicking outside
  document.addEventListener("click", handleOutsideClick);
}

// Authentication functions
function showAuthModal() {
  document.getElementById("app-container").style.display = "none";
  openModal("auth-overlay");
}

function hideAuthModal() {
  closeModal("auth-overlay");
  document.getElementById("app-container").style.display = "grid";
}

function toggleAuthMode() {
  const title = document.getElementById("auth-title");
  const submitBtn = document.getElementById("auth-submit");
  const toggleBtn = document.getElementById("auth-toggle");
  const emailGroup = document.getElementById("email-group");

  if (title.textContent === "Login") {
    title.textContent = "Register";
    submitBtn.textContent = "Register";
    toggleBtn.textContent = "Back to Login";
    emailGroup.style.display = "block";
    document.getElementById("email").required = true;
  } else {
    title.textContent = "Login";
    submitBtn.textContent = "Login";
    toggleBtn.textContent = "Create Account";
    emailGroup.style.display = "none";
    document.getElementById("email").required = false;
  }
}

async function handleAuth(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const isLogin = document.getElementById("auth-title").textContent === "Login";

  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  if (!isLogin) {
    data.email = formData.get("email");
  }

  try {
    showLoading();

    if (isLogin) {
      await api.login(data);
    } else {
      await api.register(data);
    }

    currentUser = { username: data.username };
    document.getElementById("username-display").textContent = data.username;

    hideAuthModal();
    showApp();
    await loadAppData();

    showToast(`Welcome${isLogin ? " back" : ""}, ${data.username}!`);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

function logout() {
  api.logout();
  currentUser = null;
  currentTasks = [];
  currentCategories = [];
  showAuthModal();
  resetForm("auth-form");
}

// App display functions
function showApp() {
  document.getElementById("app-container").style.display = "flex";
  updateUserProfile();
}

async function loadAppData() {
  try {
    showLoading();

    // Load categories and tasks in parallel
    const [categories, tasks] = await Promise.all([
      api.getCategories(),
      api.getTasks(),
    ]);

    currentCategories = categories;
    currentTasks = tasks;

    renderCategories();
    renderTasks();
    updateTaskCounts();
  } catch (error) {
    showToast("Failed to load data: " + error.message, "error");
  } finally {
    hideLoading();
  }
}

// Task management functions
async function loadTasks(filters = {}) {
  try {
    showLoading();
    currentFilter = filters;

    const tasks = await api.getTasks(filters);
    currentTasks = tasks;

    renderTasks();
    updateTaskCounts();
  } catch (error) {
    showToast("Failed to load tasks: " + error.message, "error");
  } finally {
    hideLoading();
  }
}

function renderTasks() {
  const tasksList = document.getElementById("tasks-grid");

  if (currentTasks.length === 0) {
    showEmptyState();
    return;
  }

  showTasksList();
  tasksList.innerHTML = "";

  currentTasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    tasksList.appendChild(taskCard);
  });
}

async function toggleTask(taskId) {
  try {
    const updatedTask = await api.toggleTaskCompletion(taskId);

    // Update task in current list
    const taskIndex = currentTasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      currentTasks[taskIndex] = updatedTask;
    }

    renderTasks();
    updateTaskCounts();

    showToast(`Task ${updatedTask.is_completed ? "completed" : "reopened"}!`);
  } catch (error) {
    showToast("Failed to update task: " + error.message, "error");
  }
}

// Task modal functions
function openTaskModal(task = null) {
  editingTask = task;

  const modal = document.getElementById("task-modal");
  const title = document.getElementById("task-modal-title");
  const deleteBtn = document.getElementById("delete-task-btn");

  if (task) {
    title.textContent = "Edit Task";
    deleteBtn.style.display = "block";
    populateTaskForm(task);
  } else {
    title.textContent = "Add New Task";
    deleteBtn.style.display = "none";
    resetForm("task-form");
  }

  // Populate category dropdown
  populateSelect(
    "task-category",
    currentCategories,
    "id",
    "name",
    "No Category"
  );

  openModal("task-modal");
}

function closeTaskModal() {
  editingTask = null;
  closeModal("task-modal");
  resetForm("task-form");
}

function populateTaskForm(task) {
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-description").value = task.description || "";
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-category").value = task.category || "";
  document.getElementById("task-due-date").value = formatDateForInput(
    task.due_date
  );
}

async function handleTaskSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const taskData = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    category: formData.get("category") || null,
    due_date: formData.get("due_date") || null,
  };

  // Validation
  const errors = validateForm(taskData, ["title"]);
  if (errors.length > 0) {
    showToast(errors.join(", "), "error");
    return;
  }

  try {
    let savedTask;

    if (editingTask) {
      savedTask = await api.updateTask(editingTask.id, taskData);
      showToast("Task updated successfully!");

      // Update task in current list
      const taskIndex = currentTasks.findIndex((t) => t.id === editingTask.id);
      if (taskIndex !== -1) {
        currentTasks[taskIndex] = savedTask;
      }
    } else {
      savedTask = await api.createTask(taskData);
      showToast("Task created successfully!");
      currentTasks.unshift(savedTask);
    }

    renderTasks();
    updateTaskCounts();
    closeTaskModal();
  } catch (error) {
    showToast("Failed to save task: " + error.message, "error");
  }
}

async function deleteTask() {
  if (!editingTask) return;

  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await api.deleteTask(editingTask.id);

    // Remove task from current list
    currentTasks = currentTasks.filter((t) => t.id !== editingTask.id);

    renderTasks();
    updateTaskCounts();
    closeTaskModal();

    showToast("Task deleted successfully!");
  } catch (error) {
    showToast("Failed to delete task: " + error.message, "error");
  }
}

// Category management functions
function renderCategories() {
  const categoriesList = document.getElementById("categories-list");
  categoriesList.innerHTML = "";

  currentCategories.forEach((category) => {
    const categoryItem = createCategoryItem(category);
    categoriesList.appendChild(categoryItem);
  });
}

function openCategoryModal() {
  resetForm("category-form");
  openModal("category-modal");
}

function closeCategoryModal() {
  closeModal("category-modal");
}

async function handleCategorySubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const categoryData = {
    name: formData.get("name"),
  };

  // Validation
  const errors = validateForm(categoryData, ["name"]);
  if (errors.length > 0) {
    showToast(errors.join(", "), "error");
    return;
  }

  try {
    const newCategory = await api.createCategory(categoryData);
    currentCategories.push(newCategory);

    renderCategories();
    closeCategoryModal();

    showToast("Category created successfully!");
  } catch (error) {
    showToast("Failed to create category: " + error.message, "error");
  }
}

// Filter functions
function showAllTasks() {
  setActiveNavItem("all-tasks-btn");
  updatePageTitle("All Tasks");
  loadTasks();
}

function filterByCategory(categoryId) {
  const category = currentCategories.find((c) => c.id === categoryId);
  if (category) {
    updatePageTitle(`${category.name} Tasks`);
    loadTasks({ category: categoryId });
  }
}

function filterByPriority(priority) {
  updatePageTitle(
    `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Tasks`
  );
  loadTasks({ priority });
}

function filterByCompleted(completed) {
  updatePageTitle(completed ? "Completed Tasks" : "Pending Tasks");
  loadTasks({ completed });
}

// Search functions
function handleSearch(event) {
  const searchTerm = event.target.value.trim();

  if (searchTerm) {
    document.querySelector(".search-clear").style.display = "block";
    updatePageTitle(`Search: "${searchTerm}"`);
    loadTasks({ search: searchTerm });
  } else {
    clearSearch();
  }
}

function clearSearch() {
  document.getElementById("search-input").value = "";
  document.querySelector(".search-clear").style.display = "none";
  showAllTasks();
}

function searchTasks() {
  const searchInput = document.getElementById("search-input");
  handleSearch({ target: searchInput });
}

// UI utility functions
function updateTaskCounts() {
  const allTasksCount = document.getElementById("all-tasks-count");
  allTasksCount.textContent = currentTasks.length;

  // Update category task counts
  currentCategories.forEach((category) => {
    const categoryTasks = currentTasks.filter(
      (task) => task.category === category.id
    );
    category.task_count = categoryTasks.length;
  });

  renderCategories();
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  const isOpen = sidebar.classList.contains("open");

  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  sidebar.classList.add("open");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  sidebar.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

function handleResize() {
  if (window.innerWidth > 1023) {
    closeSidebar();
  }
}

function handleOutsideClick(event) {
  // Close sidebar on mobile when clicking outside
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.querySelector(".mobile-menu-btn");

  if (
    isMobile() &&
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !menuBtn.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Enhanced sidebar functions
function showOverdueTasks() {
  const now = new Date();
  const overdueTasks = currentTasks.filter((task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < now;
  });

  updateActiveNavLink();
  displayTasks(overdueTasks);
  updatePageTitle("Overdue Tasks");
}

function toggleUserMenu() {
  // This could open a dropdown menu in the future
  // For now, we'll show a simple profile info
  showToast(`Logged in as ${currentUser.username}`, "info");
}

function updateActiveNavLink() {
  // Remove active class from all nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
}

function setActiveNavLink(linkId) {
  updateActiveNavLink();
  const link = document.getElementById(linkId);
  if (link) {
    link.classList.add("active");
  }
}

function updatePageTitle(title) {
  document.getElementById("page-title").textContent = title;
}

function updateUserProfile() {
  if (currentUser) {
    const usernameDisplay = document.getElementById("username-display");
    const userAvatar = document.getElementById("user-avatar");

    if (usernameDisplay) {
      usernameDisplay.textContent = currentUser.username;
    }

    if (userAvatar) {
      userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    }
  }
}

// Global functions for HTML onclick handlers
window.showAuthModal = showAuthModal;
window.closeAuthModal = () => closeModal("auth-overlay");
window.toggleAuthMode = toggleAuthMode;
window.logout = logout;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.deleteTask = deleteTask;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.showAllTasks = showAllTasks;
window.filterByCategory = filterByCategory;
window.filterByPriority = filterByPriority;
window.filterByCompleted = filterByCompleted;
window.searchTasks = searchTasks;
window.clearSearch = clearSearch;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleTask = toggleTask;
window.showOverdueTasks = showOverdueTasks;
window.toggleUserMenu = toggleUserMenu;

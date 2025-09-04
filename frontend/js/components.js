// UI Component Functions

// Toast notification system
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  toast.innerHTML = `
        <div class="toast-message">${message}</div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: inherit;">×</button>
    `;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Loading state management
function showLoading() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("tasks-grid").style.display = "none";
  document.getElementById("empty-state").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// Empty state management
function showEmptyState() {
  document.getElementById("empty-state").style.display = "block";
  document.getElementById("tasks-grid").style.display = "none";
}

function showTasksList() {
  document.getElementById("tasks-grid").style.display = "grid";
  document.getElementById("empty-state").style.display = "none";
}

// Task card creation
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = `task-card priority-${task.priority}${
    task.is_completed ? " completed" : ""
  }`;
  card.onclick = () => openTaskModal(task);

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : "";
  const category = task.category_name || "No Category";

  card.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <div class="task-checkbox ${
              task.is_completed ? "checked" : ""
            }" onclick="event.stopPropagation(); toggleTask(${task.id})">
                ${task.is_completed ? "✓" : ""}
            </div>
        </div>
        ${
          task.description
            ? `<p class="task-description">${task.description}</p>`
            : ""
        }
        <div class="task-meta">
            <div>
                <span class="task-category">${category}</span>
                <span class="priority-indicator priority-${
                  task.priority
                }"></span>
            </div>
            ${dueDate ? `<span>Due: ${dueDate}</span>` : ""}
        </div>
    `;

  return card;
}

// Category list item creation
function createCategoryItem(category) {
  const item = document.createElement("a");
  item.href = "#";
  item.className = "nav-link";
  item.onclick = (e) => {
    e.preventDefault();
    filterByCategory(category.id);
  };

  item.innerHTML = `
        <svg class="nav-icon" width="20" height="20">
            <use href="#icon-folder"></use>
        </svg>
        <span>${category.name}</span>
        <span class="badge">${category.task_count || 0}</span>
    `;

  return item;
}

// Modal management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// Form utilities
function resetForm(formId) {
  document.getElementById(formId).reset();
}

function populateSelect(
  selectId,
  options,
  valueKey = "id",
  textKey = "name",
  defaultText = "Select..."
) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${defaultText}</option>`;

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option[valueKey];
    optionElement.textContent = option[textKey];
    select.appendChild(optionElement);
  });
}

// Navigation utilities
function setActiveNavItem(itemId) {
  // Remove active class from all nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class to selected item
  const activeItem = document.getElementById(itemId);
  if (activeItem) {
    activeItem.classList.add("active");
  }
}

function updatePageTitle(title) {
  document.getElementById("page-title").textContent = title;
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Validation utilities
function validateForm(formData, required = []) {
  const errors = [];

  required.forEach((field) => {
    if (!formData[field] || formData[field].trim() === "") {
      errors.push(
        `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      );
    }
  });

  return errors;
}

// Search utilities
function highlightSearchTerms(text, searchTerm) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// Mobile utilities
function isMobile() {
  return window.innerWidth <= 767;
}

function isTablet() {
  return window.innerWidth <= 1023 && window.innerWidth > 767;
}

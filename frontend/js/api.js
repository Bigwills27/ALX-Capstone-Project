// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000/api";

// API Helper Functions
class TaskAPI {
  constructor() {
    this.token = localStorage.getItem("authToken");
    this.baseURL = API_BASE_URL;
  }

  // Get authentication headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.token) {
      headers["Authorization"] = `Token ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Authentication failed");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || `HTTP ${response.status}`
        );
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Handle authentication errors
  handleAuthError() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    this.token = null;

    // Show auth modal if user is not on auth page
    if (window.showAuthModal) {
      window.showAuthModal();
    }
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Authentication endpoints
  async register(userData) {
    const response = await this.request("/register/", {
      method: "POST",
      body: JSON.stringify(userData),
      auth: false,
    });

    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem("username", response.user.username);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request("/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
      auth: false,
    });

    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem("username", response.username);
    }

    return response;
  }

  logout() {
    this.clearAuth();
  }

  // Task endpoints
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = `/tasks/${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;
    return await this.request(endpoint);
  }

  async getTask(taskId) {
    return await this.request(`/tasks/${taskId}/`);
  }

  async createTask(taskData) {
    return await this.request("/tasks/", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return await this.request(`/tasks/${taskId}/`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return await this.request(`/tasks/${taskId}/`, {
      method: "DELETE",
    });
  }

  async toggleTaskCompletion(taskId) {
    return await this.request(`/tasks/${taskId}/toggle/`, {
      method: "PATCH",
    });
  }

  // Category endpoints
  async getCategories() {
    return await this.request("/categories/");
  }

  async getCategory(categoryId) {
    return await this.request(`/categories/${categoryId}/`);
  }

  async createCategory(categoryData) {
    return await this.request("/categories/", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryId, categoryData) {
    return await this.request(`/categories/${categoryId}/`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(categoryId) {
    return await this.request(`/categories/${categoryId}/`, {
      method: "DELETE",
    });
  }
}

// Create global API instance
window.api = new TaskAPI();

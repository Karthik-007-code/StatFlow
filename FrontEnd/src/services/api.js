import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("statflow_user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// ---------------------------------------------------------------------------
// Task endpoints
// ---------------------------------------------------------------------------
export const fetchTasks = () => API.get("/tasks");
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const toggleDay = (id, day) => API.patch(`/tasks/${id}/toggle/${day}`);

// ---------------------------------------------------------------------------
// Report endpoint
// ---------------------------------------------------------------------------
export const fetchMonthlyReport = () => API.get("/tasks/report/monthly");

export default API;

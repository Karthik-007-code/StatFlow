import axios from "axios";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});


API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("statflow_user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});


export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

export const fetchTasks = () => API.get("/tasks");
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const toggleDay = (id, day) => API.patch(`/tasks/${id}/toggle/${day}`);


export const fetchMonthlyReport = () => API.get("/tasks/report/monthly");

export default API;

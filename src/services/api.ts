import axios from "axios";

// ============================================================================
// CONFIGURATION: Axios Instance Setup
// ============================================================================
const api = axios.create({
  // Aseguramos que el prefijo sea exactamente el mismo que acepta tu backend
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// ACTION: Intercept Requests
// ============================================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;

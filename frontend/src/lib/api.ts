import axios from "axios";
import { resolveTenant } from "./tenant";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // 1. Add X-Tenant header dynamically from URL context
    const tenant = resolveTenant();
    if (tenant) {
      config.headers["X-Tenant"] = tenant;
    }

    // 2. Add JWT Bearer token if logged in
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

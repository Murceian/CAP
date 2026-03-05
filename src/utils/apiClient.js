import axios from "axios";
import logger from "./logger";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Unknown error";
    const status = error.response?.status;

    logger.error(`API Error (${status}): ${message}`, error);

    return Promise.reject({
      status,
      message,
      originalError: error,
    });
  }
);

export default apiClient;

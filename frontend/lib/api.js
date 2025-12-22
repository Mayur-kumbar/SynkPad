import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true, 
});

export default api;


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ reject }) => reject(error));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((_, reject) => {
        failedQueue.push({ reject });
      });
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh-token");
      isRefreshing = false;
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);

      return Promise.reject(refreshError);
    }
  }
);


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

/* ---------- REFRESH QUEUE ---------- */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedQueue = [];
};

/* ---------- RESPONSE INTERCEPTOR ---------- */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ❌ Never refresh on refresh endpoint
    if (originalRequest.url.includes("/auth/refresh-token")) {
      // window.location.href = "/signup";
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      // window.location.href = "/signup";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh-token");
      processQueue();
      isRefreshing = false;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      isRefreshing = false;
      // window.location.href = "/signup";
      return Promise.reject(refreshError);
    }
  }
);

export default api;

import axios, { type AxiosRequestConfig } from "axios";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true, // cookies are sent automatically
});

// ------------------- Request Interceptor ------------------- //
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add additional headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------- Refresh Token Logic ------------------- //
let isRefreshing = false;

let pendingQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  pendingQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(null);
    }
  });
  pendingQueue = [];
};

// ------------------- Response Interceptor ------------------- //
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // CRITICAL FIX: Don't try to refresh token for auth endpoints
    const authEndpoints = ['/user/login', '/user/register', '/user/refresh-token', '/user/forget-password', '/user/reset-password'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

    // If 401 Unauthorized AND not an auth endpoint, try refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      // If a refresh request is already running, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Call refresh token endpoint (cookies sent automatically)
        await axiosInstance.post("/user/refresh-token");

        processQueue(null);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://timepilot-backend-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle 401s and auto-refresh token
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });
          if (res.data?.data?.access_token) {
            localStorage.setItem("access_token", res.data.data.access_token);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.access_token}`;
            // Retry the original request
            const retryRes = await axios(originalRequest);
            return retryRes.data;
          }
        }
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

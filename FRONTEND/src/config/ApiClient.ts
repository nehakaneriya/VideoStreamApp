import useAuthStore from "@/auth/store";
import useAdminStore from "@/auth/adminStore";
import { refreshToken, adminRefreshToken } from "@/service/Authservice";
import axios from "axios";


const apiClient = axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL || "http://localhost:2911/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    // timeout: 0 → unlimited (video upload + ffmpeg processing ke liye zaroori)
    // Individual requests apna timeout set kar sakte hain
    timeout: 0,
});

// JWT automatically attach karega — admin token ko priority dega
apiClient.interceptors.request.use((config) => {
    const url = config.url || "";
    const isAdminRequest = url.includes("/admin");

    const adminToken = useAdminStore.getState().adminToken;
    const userToken = useAuthStore.getState().accessToken;

    const token = isAdminRequest ? adminToken : userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

function queueRequest(callback: (token: string) => void) {
  pendingRequests.push(callback);
}

function resolveQueue(newToken: string) {
  pendingRequests.forEach((callback) => callback(newToken));
  pendingRequests = [];
}

// Response interceptor — 401 pe token refresh karo
apiClient.interceptors.response.use(
  (response) => response,
  async(error) => {
    const is401 = error.response?.status === 401;
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    // Auth endpoints par retry mat karo — infinite loop hoga
    // /auth/me ko retry karne do (wo protected endpoint hai, uska 401 = real session invalid)
    // /auth/refresh aur /auth/login pe retry nahi hoga
    const isRefreshOrLoginEndpoint = requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/admin/refresh") ||
      requestUrl.includes("/auth/admin/login");

    if (!error.response || !is401 || originalRequest._retry || isRefreshOrLoginEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queueRequest((newToken:string) => {
          if (!newToken) return reject("Token refresh failed");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    // Admin request hai ya user request?
    const url = originalRequest.url || "";
    const isAdminRequest = url.includes("/admin");

    try {
      let newToken: string;

      if (isAdminRequest) {
        // Admin ka alag refresh endpoint
        const res = await adminRefreshToken();
        newToken = res.accessToken;
        if (useAdminStore.getState().adminLogin !== undefined) {
          useAdminStore.setState({
            adminToken: newToken,
            adminUser: res.user,
            adminStatus: true,
          });
        }
      } else {
        // User ka refresh endpoint
        const res = await refreshToken();
        newToken = res.accessToken;
        useAuthStore.getState().changeLocalLoginData(res.accessToken, res.user, true);
      }

      if (!newToken) throw new Error("Failed to refresh token");

      resolveQueue(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);

    } catch(err) {
      resolveQueue('');
      if (isAdminRequest) {
        useAdminStore.getState().adminLogout();
      } else {
        useAuthStore.getState().logout();
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;

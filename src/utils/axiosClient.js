import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // cookie send/receive साठी
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to attach token from localStorage (header-based auth)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // token from localStorage

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // attach to every request
  }

  return config;
});

export default axiosClient;

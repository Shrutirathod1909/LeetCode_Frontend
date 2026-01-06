import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
(error) => Promise.reject(error)
);

export default axiosClient;

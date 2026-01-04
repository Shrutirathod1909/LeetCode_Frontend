import axiosClient from "./axiosClient";

// User login
export const loginUser = async (emailId, password) => {
  try {
    const res = await axiosClient.post("/user/login", { emailId, password });
    localStorage.setItem("token", res.data.token);
    return res.data.user;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};

// Admin login
export const loginAdmin = async (emailId, password) => {
  try {
    const res = await axiosClient.post("/user/admin/login", { emailId, password });
    localStorage.setItem("token", res.data.token);
    return res.data.admin;
  } catch (err) {
    console.error("Admin login error:", err.response?.data || err.message);
    throw err;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await axiosClient.post("/user/logout");
    localStorage.removeItem("token");
  } catch (err) {
    console.error("Logout error:", err.response?.data || err.message);
    throw err;
  }
};

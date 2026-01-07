import axiosClient from "./utils/axiosClient";

// User login
export const loginUser = async (emailId, password) => {
  const res = await axiosClient.post("/user/login", { emailId, password });

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
};


// Admin login
export const loginAdmin = async (emailId, password) => {
  const res = await axiosClient.post("/user/admin/login", { emailId, password });

  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.admin));
  }

  return res.data;
};


// Logout
export const logoutUser = async () => {
  await axiosClient.post("/user/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


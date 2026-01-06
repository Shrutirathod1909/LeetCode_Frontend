import axiosClient from "./utils/axiosClient";

// User login
export const loginUser = async (emailId, password) => {
  const res = await axiosClient.post("/user/login", { emailId, password });
  return res.data; // { token, user }
};

// Admin login
export const loginAdmin = async (emailId, password) => {
  const res = await axiosClient.post("/user/admin/login", { emailId, password });
  return res.data; // { token, admin }
};

// Logout
export const logoutUser = async () => {
  await axiosClient.post("/user/logout");
};

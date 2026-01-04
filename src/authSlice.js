// src/authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

// ------------------ USER REGISTER ------------------
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      localStorage.setItem("token", response.data.token);
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// ------------------ USER LOGIN ------------------
export const loginUserThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);
      localStorage.setItem("token", response.data.token);
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// ------------------ ADMIN LOGIN ------------------
export const loginAdminThunk = createAsyncThunk(
  "auth/adminLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/admin/login", credentials);
      localStorage.setItem("token", response.data.token);
      return response.data.admin;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// ------------------ CHECK AUTH ------------------
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/user/check");
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// ------------------ LOGOUT ------------------
export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      localStorage.removeItem("token");
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// ------------------ SLICE ------------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    // simple local logout (without API call)
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = !!action.payload; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || "Something went wrong"; state.user = null; state.isAuthenticated = false; })

      // USER LOGIN
      .addCase(loginUserThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUserThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = !!action.payload; })
      .addCase(loginUserThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || "Something went wrong"; state.user = null; state.isAuthenticated = false; })

      // ADMIN LOGIN
      .addCase(loginAdminThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdminThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = !!action.payload; })
      .addCase(loginAdminThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || "Something went wrong"; state.user = null; state.isAuthenticated = false; })

      // CHECK AUTH
      .addCase(checkAuth.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkAuth.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = !!action.payload; })
      .addCase(checkAuth.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || "Something went wrong"; state.user = null; state.isAuthenticated = false; })

      // LOGOUT
      .addCase(logoutUserThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(logoutUserThunk.fulfilled, (state) => { state.loading = false; state.user = null; state.isAuthenticated = false; state.error = null; })
      .addCase(logoutUserThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || "Something went wrong"; state.user = null; state.isAuthenticated = false; });
  },
});

// Export the simple logout action
export const { logoutUser } = authSlice.actions;

// Export reducer as default
export default authSlice.reducer;

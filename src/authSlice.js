import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

/* ---------------- REGISTER ---------------- */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/register", userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Register failed");
    }
  }
);

/* ---------------- USER LOGIN ---------------- */
export const loginUserThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/login", credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

/* ---------------- ADMIN LOGIN ---------------- */
export const loginAdminThunk = createAsyncThunk(
  "auth/adminLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/admin/login", credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Admin login failed");
    }
  }
);

/* ---------------- CHECK AUTH ---------------- */
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/user/check");
      return res.data.user;
    } catch {
      return rejectWithValue("Not authenticated");
    }
  }
);

/* ---------------- LOGOUT ---------------- */
export const logoutUserThunk = createAsyncThunk("auth/logout", async () => {
  await axiosClient.post("/user/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return null;
});

/* ---------------- SLICE ---------------- */
const token = localStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* REGISTER */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* USER LOGIN */
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADMIN LOGIN */
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload.admin, role: "admin" };
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem("token", action.payload.token);
      })

      /* CHECK AUTH */
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...action.payload,
          role: action.payload.role || "user",
        };
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      /* LOGOUT */
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export default authSlice.reducer;

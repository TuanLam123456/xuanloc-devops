import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

// Dò phiên đăng nhập khi app khởi động (token nằm trong cookie httpOnly, FE không tự đọc
// được). condition chặn gọi trùng nếu nhiều component cùng mount (giống fetchPublicCourses).
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.ME);
      // getMe trả thẳng object user (không bọc trong { user }, khác với login bên dưới)
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => getState().auth.meStatus === "idle",
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.LOGIN, { email, password });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.LOGOUT);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    // Bật đúng 1 lần khi fetchMe có kết quả lần đầu (thành công hoặc thất bại) - phân biệt
    // "đang kiểm tra phiên" với "đã xác nhận chưa đăng nhập". Không reset khi logout, để
    // ProtectedRoute/LoginPage không hiện lại spinner sau khi đã có câu trả lời.
    initialized: false,
    meStatus: "idle",
    meError: null,
    loginStatus: "idle",
    loginError: null,
    logoutStatus: "idle",
    logoutError: null,
  },
  reducers: {
    // Đồng bộ tức thời các trường cơ bản (avatar_url, full_name...) vào navbar sau khi user
    // tự cập nhật hồ sơ/avatar, không cần chờ round-trip fetchMe.
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.meStatus = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.meStatus = "succeeded";
        state.initialized = true;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.meStatus = "failed";
        state.meError = action.payload;
        state.initialized = true;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.loginStatus = "loading";
        state.loginError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.user = action.payload.user; // login bọc user trong { user }, khác getMe
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.loginError = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.logoutStatus = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.logoutStatus = "succeeded";
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // Dù API logout lỗi (vd. token đã hết hạn sẵn) vẫn coi như đã đăng xuất phía client
        state.logoutStatus = "failed";
        state.logoutError = action.payload;
        state.user = null;
      });
  },
});

export const { updateAuthUser } = authSlice.actions;
export default authSlice.reducer;

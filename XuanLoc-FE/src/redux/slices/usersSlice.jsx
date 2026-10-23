import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.USERS, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.USERS, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${ENDPOINTS.USERS}/${id}`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.USERS}/${id}/status`, { status });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const resetUserPassword = createAsyncThunk(
  "users/resetUserPassword",
  async ({ id, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.USERS}/${id}/reset-password`, {
        newPassword,
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const setTeacherRate = createAsyncThunk(
  "users/setTeacherRate",
  async ({ id, rate_per_session }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.USERS}/${id}/rate`, {
        rate_per_session,
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.USERS}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(setTeacherRate.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u.teacher_details?.user_id === action.payload.user_id);
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            teacher_details: { ...state.items[idx].teacher_details, ...action.payload },
          };
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;

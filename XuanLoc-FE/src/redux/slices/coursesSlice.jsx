import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.COURSES, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.COURSES, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${ENDPOINTS.COURSES}/${id}`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleCourseStatus = createAsyncThunk(
  "courses/toggleCourseStatus",
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.COURSES}/${id}/status`, { is_active });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.COURSES}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(toggleCourseStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export default coursesSlice.reducer;

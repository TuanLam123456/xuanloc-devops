import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchStudentSchedule = createAsyncThunk(
  "schedule/fetchStudentSchedule",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.STUDENT_SCHEDULE, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTeacherSchedule = createAsyncThunk(
  "schedule/fetchTeacherSchedule",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.TEACHER_SCHEDULE, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState: {
    studentItems: [],
    studentStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    studentError: null,

    teacherItems: [],
    teacherStatus: "idle",
    teacherError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentSchedule.pending, (state) => {
        state.studentStatus = "loading";
      })
      .addCase(fetchStudentSchedule.fulfilled, (state, action) => {
        state.studentStatus = "succeeded";
        state.studentItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStudentSchedule.rejected, (state, action) => {
        state.studentStatus = "failed";
        state.studentError = action.payload;
      })

      .addCase(fetchTeacherSchedule.pending, (state) => {
        state.teacherStatus = "loading";
      })
      .addCase(fetchTeacherSchedule.fulfilled, (state, action) => {
        state.teacherStatus = "succeeded";
        state.teacherItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTeacherSchedule.rejected, (state, action) => {
        state.teacherStatus = "failed";
        state.teacherError = action.payload;
      });
  },
});

export default scheduleSlice.reducer;

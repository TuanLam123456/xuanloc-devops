import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMyAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.MY_ATTENDANCE, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    myItems: [],
    myStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    myError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAttendance.pending, (state) => {
        state.myStatus = "loading";
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.myStatus = "succeeded";
        state.myItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.myStatus = "failed";
        state.myError = action.payload;
      });
  },
});

export default attendanceSlice.reducer;

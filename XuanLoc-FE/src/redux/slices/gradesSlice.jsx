import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchMyGrades = createAsyncThunk(
  "grades/fetchMyGrades",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.MY_GRADES);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const gradesSlice = createSlice({
  name: "grades",
  initialState: {
    myItems: [],
    myStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    myError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyGrades.pending, (state) => {
        state.myStatus = "loading";
      })
      .addCase(fetchMyGrades.fulfilled, (state, action) => {
        state.myStatus = "succeeded";
        state.myItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyGrades.rejected, (state, action) => {
        state.myStatus = "failed";
        state.myError = action.payload;
      });
  },
});

export default gradesSlice.reducer;

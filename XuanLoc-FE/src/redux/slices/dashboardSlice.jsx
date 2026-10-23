import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.DASHBOARD}/overview`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRevenueTrend = createAsyncThunk(
  "dashboard/fetchRevenueTrend",
  async (months, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.DASHBOARD}/revenue-trend`, {
        params: { months },
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    overview: null,
    overviewStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    overviewError: null,
    revenueTrend: [],
    revenueTrendStatus: "idle",
    revenueTrendError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.overviewStatus = "loading";
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.overviewStatus = "succeeded";
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.overviewStatus = "failed";
        state.overviewError = action.payload;
      })
      .addCase(fetchRevenueTrend.pending, (state) => {
        state.revenueTrendStatus = "loading";
      })
      .addCase(fetchRevenueTrend.fulfilled, (state, action) => {
        state.revenueTrendStatus = "succeeded";
        state.revenueTrend = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRevenueTrend.rejected, (state, action) => {
        state.revenueTrendStatus = "failed";
        state.revenueTrendError = action.payload;
      });
  },
});

export default dashboardSlice.reducer;

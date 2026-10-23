import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchAuditLogs",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.AUDIT_LOGS, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      });
  },
});

export default auditLogsSlice.reducer;

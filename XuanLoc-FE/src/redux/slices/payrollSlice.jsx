import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

// BE trả về { month, year, rows: [...], total_pay } - không phân trang theo trang/kích thước trang.
export const fetchPayroll = createAsyncThunk(
  "payroll/fetchPayroll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.PAYROLL, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTeacherPayroll = createAsyncThunk(
  "payroll/fetchTeacherPayroll",
  async ({ teacherId, ...params }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.PAYROLL}/${teacherId}`, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState: {
    month: null,
    year: null,
    rows: [],
    totalPay: 0,
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,

    myPayroll: null,
    myStatus: "idle",
    myError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayroll.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.month = action.payload?.month ?? null;
        state.year = action.payload?.year ?? null;
        state.rows = Array.isArray(action.payload?.rows) ? action.payload.rows : [];
        state.totalPay = action.payload?.total_pay ?? 0;
      })
      .addCase(fetchPayroll.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })

      .addCase(fetchTeacherPayroll.pending, (state) => {
        state.myStatus = "loading";
      })
      .addCase(fetchTeacherPayroll.fulfilled, (state, action) => {
        state.myStatus = "succeeded";
        state.myPayroll = action.payload;
      })
      .addCase(fetchTeacherPayroll.rejected, (state, action) => {
        state.myStatus = "failed";
        state.myError = action.payload;
      });
  },
});

export default payrollSlice.reducer;

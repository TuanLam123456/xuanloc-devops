import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

// --- Rooms (danh sách nhỏ, BE không phân trang) ---

export const fetchRooms = createAsyncThunk(
  "settings/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.ROOMS);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createRoom = createAsyncThunk(
  "settings/createRoom",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.ROOMS, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateRoom = createAsyncThunk(
  "settings/updateRoom",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${ENDPOINTS.ROOMS}/${id}`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleRoomStatus = createAsyncThunk(
  "settings/toggleRoomStatus",
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.ROOMS}/${id}/status`, { is_active });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Vouchers (có phân trang) ---

export const fetchVouchers = createAsyncThunk(
  "settings/fetchVouchers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.VOUCHERS, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createVoucher = createAsyncThunk(
  "settings/createVoucher",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.VOUCHERS, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleVoucherStatus = createAsyncThunk(
  "settings/toggleVoucherStatus",
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.VOUCHERS}/${id}/status`, { is_active });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    rooms: [],
    roomsStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    roomsError: null,
    vouchers: [],
    vouchersPagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    vouchersStatus: "idle",
    vouchersError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.roomsStatus = "loading";
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.roomsStatus = "succeeded";
        state.rooms = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.roomsStatus = "failed";
        state.roomsError = action.payload;
      })
      .addCase(toggleRoomStatus.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = { ...state.rooms[idx], ...action.payload };
      })
      .addCase(fetchVouchers.pending, (state) => {
        state.vouchersStatus = "loading";
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.vouchersStatus = "succeeded";
        state.vouchers = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.vouchersPagination = action.payload?.pagination || state.vouchersPagination;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.vouchersStatus = "failed";
        state.vouchersError = action.payload;
      })
      .addCase(toggleVoucherStatus.fulfilled, (state, action) => {
        const idx = state.vouchers.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.vouchers[idx] = { ...state.vouchers[idx], ...action.payload };
      });
  },
});

export default settingsSlice.reducer;

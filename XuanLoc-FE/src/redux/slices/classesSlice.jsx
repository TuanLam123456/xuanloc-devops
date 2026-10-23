import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

// --- Lớp học (shell) ---

export const fetchClasses = createAsyncThunk(
  "classes/fetchClasses",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.CLASSES, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createClass = createAsyncThunk(
  "classes/createClass",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.CLASSES, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateClass = createAsyncThunk(
  "classes/updateClass",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${ENDPOINTS.CLASSES}/${id}`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteClass = createAsyncThunk(
  "classes/deleteClass",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.CLASSES}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Giáo viên: lớp tôi dạy ---

export const fetchMyTaughtClasses = createAsyncThunk(
  "classes/fetchMyTaughtClasses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.MY_TAUGHT_CLASSES);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Lịch học ---

export const fetchSchedules = createAsyncThunk(
  "classes/fetchSchedules",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.SCHEDULES}/class/${classId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createSchedule = createAsyncThunk(
  "classes/createSchedule",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.SCHEDULES, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateSchedule = createAsyncThunk(
  "classes/updateSchedule",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${ENDPOINTS.SCHEDULES}/${id}`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteSchedule = createAsyncThunk(
  "classes/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.SCHEDULES}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Điểm danh ---

export const fetchAttendanceRoster = createAsyncThunk(
  "classes/fetchAttendanceRoster",
  async ({ classId, date }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ATTENDANCE}/class/${classId}`, {
        params: { date },
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveBatchAttendance = createAsyncThunk(
  "classes/saveBatchAttendance",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.ATTENDANCE_BATCH, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Danh sách chờ ---

export const fetchWaitlist = createAsyncThunk(
  "classes/fetchWaitlist",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.WAITLIST}/class/${classId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const promoteFromWaitlist = createAsyncThunk(
  "classes/promoteFromWaitlist",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.WAITLIST}/${id}/promote`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeFromWaitlist = createAsyncThunk(
  "classes/removeFromWaitlist",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.WAITLIST}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const classesSlice = createSlice({
  name: "classes",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,

    myTaughtItems: [],
    myTaughtStatus: "idle",
    myTaughtError: null,

    schedules: [],
    schedulesStatus: "idle",
    schedulesError: null,

    attendanceRoster: [],
    attendanceStatus: "idle",
    attendanceError: null,

    waitlist: [],
    waitlistStatus: "idle",
    waitlistError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })

      .addCase(fetchMyTaughtClasses.pending, (state) => {
        state.myTaughtStatus = "loading";
      })
      .addCase(fetchMyTaughtClasses.fulfilled, (state, action) => {
        state.myTaughtStatus = "succeeded";
        state.myTaughtItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyTaughtClasses.rejected, (state, action) => {
        state.myTaughtStatus = "failed";
        state.myTaughtError = action.payload;
      })

      .addCase(fetchSchedules.pending, (state) => {
        state.schedulesStatus = "loading";
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.schedulesStatus = "succeeded";
        state.schedules = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.schedulesStatus = "failed";
        state.schedulesError = action.payload;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter((s) => s.id !== action.payload);
      })

      .addCase(fetchAttendanceRoster.pending, (state) => {
        state.attendanceStatus = "loading";
      })
      .addCase(fetchAttendanceRoster.fulfilled, (state, action) => {
        state.attendanceStatus = "succeeded";
        state.attendanceRoster = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAttendanceRoster.rejected, (state, action) => {
        state.attendanceStatus = "failed";
        state.attendanceError = action.payload;
      })

      .addCase(fetchWaitlist.pending, (state) => {
        state.waitlistStatus = "loading";
      })
      .addCase(fetchWaitlist.fulfilled, (state, action) => {
        state.waitlistStatus = "succeeded";
        state.waitlist = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWaitlist.rejected, (state, action) => {
        state.waitlistStatus = "failed";
        state.waitlistError = action.payload;
      })
      .addCase(promoteFromWaitlist.fulfilled, (state, action) => {
        state.waitlist = state.waitlist.filter((w) => w.id !== action.meta.arg);
      })
      .addCase(removeFromWaitlist.fulfilled, (state, action) => {
        state.waitlist = state.waitlist.filter((w) => w.id !== action.payload);
      });
  },
});

export default classesSlice.reducer;

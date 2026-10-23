import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchRegistrations = createAsyncThunk(
  "registrations/fetchRegistrations",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.COURSE_REGISTRATIONS, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateRegistrationStatus = createAsyncThunk(
  "registrations/updateStatus",
  async ({ id, status, reject_reason }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.COURSE_REGISTRATIONS}/${id}/status`, {
        status,
        reject_reason,
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const assignRegistration = createAsyncThunk(
  "registrations/assign",
  async ({ id, assigned_to }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.COURSE_REGISTRATIONS}/${id}/assign`, {
        assigned_to,
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const setFollowUpDate = createAsyncThunk(
  "registrations/setFollowUp",
  async ({ id, follow_up_date }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.COURSE_REGISTRATIONS}/${id}/follow-up`, {
        follow_up_date,
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteRegistration = createAsyncThunk(
  "registrations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.COURSE_REGISTRATIONS}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRegistrationNotes = createAsyncThunk(
  "registrations/fetchNotes",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.COURSE_REGISTRATIONS}/${id}/notes`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addRegistrationNote = createAsyncThunk(
  "registrations/addNote",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.COURSE_REGISTRATIONS}/${id}/notes`, { note });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const registrationsSlice = createSlice({
  name: "registrations",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,
    notes: [],
    notesStatus: "idle",
    notesError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrations.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(updateRegistrationStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(assignRegistration.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(setFollowUpDate.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(deleteRegistration.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addCase(fetchRegistrationNotes.pending, (state) => {
        state.notesStatus = "loading";
      })
      .addCase(fetchRegistrationNotes.fulfilled, (state, action) => {
        state.notesStatus = "succeeded";
        state.notes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRegistrationNotes.rejected, (state, action) => {
        state.notesStatus = "failed";
        state.notesError = action.payload;
      })
      .addCase(addRegistrationNote.fulfilled, (state, action) => {
        state.notes = [action.payload, ...state.notes];
        const idx = state.items.findIndex((r) => r.id === action.payload.registration_id);
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            _count: { ...state.items[idx]._count, registration_notes: (state.items[idx]._count?.registration_notes || 0) + 1 },
          };
        }
      });
  },
});

export default registrationsSlice.reducer;

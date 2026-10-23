import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchCertificates = createAsyncThunk(
  "certificates/fetchCertificates",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.CERTIFICATES, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const issueCertificate = createAsyncThunk(
  "certificates/issueCertificate",
  async (enrollment_id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.CERTIFICATES, { enrollment_id });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchMyCertificates = createAsyncThunk(
  "certificates/fetchMyCertificates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.CERTIFICATES}/my-certificates`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const certificatesSlice = createSlice({
  name: "certificates",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,

    myItems: [],
    myStatus: "idle",
    myError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCertificates.pending, (state) => {
        state.myStatus = "loading";
      })
      .addCase(fetchMyCertificates.fulfilled, (state, action) => {
        state.myStatus = "succeeded";
        state.myItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyCertificates.rejected, (state, action) => {
        state.myStatus = "failed";
        state.myError = action.payload;
      })

      .addCase(fetchCertificates.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      });
  },
});

export default certificatesSlice.reducer;

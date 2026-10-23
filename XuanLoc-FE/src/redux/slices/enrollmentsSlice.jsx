import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

// --- Danh sách ghi danh ---

export const fetchEnrollments = createAsyncThunk(
  "enrollments/fetchEnrollments",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.ENROLLMENTS, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createEnrollment = createAsyncThunk(
  "enrollments/createEnrollment",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.ENROLLMENTS, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateEnrollmentStatus = createAsyncThunk(
  "enrollments/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.ENROLLMENTS}/${id}/status`, { status });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteEnrollment = createAsyncThunk(
  "enrollments/deleteEnrollment",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.ENROLLMENTS}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Học viên: ghi danh của tôi ---

export const fetchMyEnrollments = createAsyncThunk(
  "enrollments/fetchMyEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.MY_ENROLLMENTS);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Giáo viên: danh sách học viên (kèm enrollment_id) của 1 lớp mình dạy, dùng để nhập điểm ---

export const fetchEnrollmentsByClass = createAsyncThunk(
  "enrollments/fetchEnrollmentsByClass",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ENROLLMENTS}/by-class/${classId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerForClass = createAsyncThunk(
  "enrollments/registerForClass",
  async (class_id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.REGISTER_CLASS, { class_id });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Công nợ / học phí ---

export const fetchEnrollmentBalance = createAsyncThunk(
  "enrollments/fetchBalance",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ENROLLMENTS}/${id}/balance`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTransferQr = createAsyncThunk(
  "enrollments/fetchTransferQr",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ENROLLMENTS}/${id}/transfer-qr`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const setEnrollmentDiscount = createAsyncThunk(
  "enrollments/setDiscount",
  async ({ id, discount_amount }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`${ENDPOINTS.ENROLLMENTS}/${id}/discount`, { discount_amount });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const applyVoucher = createAsyncThunk(
  "enrollments/applyVoucher",
  async ({ id, code }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.ENROLLMENTS}/${id}/apply-voucher`, { code });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCashPayment = createAsyncThunk(
  "enrollments/createCashPayment",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.CASH_PAYMENTS, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPayments = createAsyncThunk(
  "enrollments/fetchPayments",
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ENROLLMENTS}/${enrollmentId}/payments`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createRefund = createAsyncThunk(
  "enrollments/createRefund",
  async ({ id, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.ENROLLMENTS}/${id}/refunds`, { amount, reason });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRefunds = createAsyncThunk(
  "enrollments/fetchRefunds",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ENROLLMENTS}/${id}/refunds`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Điểm ---

export const fetchGradesByEnrollment = createAsyncThunk(
  "enrollments/fetchGrades",
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.GRADES}/enrollment/${enrollmentId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addGrade = createAsyncThunk(
  "enrollments/addGrade",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.GRADES, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Chứng chỉ ---

export const issueCertificate = createAsyncThunk(
  "enrollments/issueCertificate",
  async (enrollment_id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.CERTIFICATES, { enrollment_id });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Báo cáo công nợ ---

export const fetchDebtReport = createAsyncThunk(
  "enrollments/fetchDebtReport",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.ENROLLMENTS}/debt-report`, { params });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const sendTuitionReminders = createAsyncThunk(
  "enrollments/sendTuitionReminders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.ENROLLMENTS}/debt-report/send-reminders`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,

    balance: null,
    balanceStatus: "idle",

    payments: [],
    paymentsStatus: "idle",

    refunds: [],
    refundsStatus: "idle",

    grades: [],
    gradesStatus: "idle",

    debtItems: [],
    debtPagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    debtStatus: "idle",
    debtError: null,

    myItems: [],
    myStatus: "idle",
    myError: null,

    byClassItems: [],
    byClassStatus: "idle",
    byClassError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollmentsByClass.pending, (state) => {
        state.byClassStatus = "loading";
      })
      .addCase(fetchEnrollmentsByClass.fulfilled, (state, action) => {
        state.byClassStatus = "succeeded";
        state.byClassItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEnrollmentsByClass.rejected, (state, action) => {
        state.byClassStatus = "failed";
        state.byClassError = action.payload;
      })

      .addCase(fetchMyEnrollments.pending, (state) => {
        state.myStatus = "loading";
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.myStatus = "succeeded";
        state.myItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.myStatus = "failed";
        state.myError = action.payload;
      })

      .addCase(fetchEnrollments.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(updateEnrollmentStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      })

      .addCase(fetchEnrollmentBalance.pending, (state) => {
        state.balanceStatus = "loading";
      })
      .addCase(fetchEnrollmentBalance.fulfilled, (state, action) => {
        state.balanceStatus = "succeeded";
        state.balance = action.payload;
      })
      .addCase(fetchEnrollmentBalance.rejected, (state) => {
        state.balanceStatus = "failed";
      })

      .addCase(fetchPayments.pending, (state) => {
        state.paymentsStatus = "loading";
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.paymentsStatus = "succeeded";
        state.payments = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchRefunds.pending, (state) => {
        state.refundsStatus = "loading";
      })
      .addCase(fetchRefunds.fulfilled, (state, action) => {
        state.refundsStatus = "succeeded";
        state.refunds = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchGradesByEnrollment.pending, (state) => {
        state.gradesStatus = "loading";
      })
      .addCase(fetchGradesByEnrollment.fulfilled, (state, action) => {
        state.gradesStatus = "succeeded";
        state.grades = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchDebtReport.pending, (state) => {
        state.debtStatus = "loading";
      })
      .addCase(fetchDebtReport.fulfilled, (state, action) => {
        state.debtStatus = "succeeded";
        state.debtItems = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.debtPagination = action.payload?.pagination || state.debtPagination;
      })
      .addCase(fetchDebtReport.rejected, (state, action) => {
        state.debtStatus = "failed";
        state.debtError = action.payload;
      });
  },
});

export default enrollmentsSlice.reducer;

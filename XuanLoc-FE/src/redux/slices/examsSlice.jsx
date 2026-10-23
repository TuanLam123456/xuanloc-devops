import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

// Đề thi được quản lý theo từng khóa học (course_id) - BE không phân trang danh sách này.
export const fetchExamsByCourse = createAsyncThunk(
  "exams/fetchExamsByCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.EXAMS}/course/${courseId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createExam = createAsyncThunk(
  "exams/createExam",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(ENDPOINTS.EXAMS, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchExamDetail = createAsyncThunk(
  "exams/fetchExamDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.EXAMS}/${id}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateExam = createAsyncThunk(
  "exams/updateExam",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`${ENDPOINTS.EXAMS}/${id}`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteExam = createAsyncThunk(
  "exams/deleteExam",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.EXAMS}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- Học viên: làm bài kiểm tra ---

export const fetchExamForTaking = createAsyncThunk(
  "exams/fetchExamForTaking",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.EXAMS}/${id}/take`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const submitExam = createAsyncThunk(
  "exams/submitExam",
  async ({ id, answers }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.EXAMS}/${id}/submit`, { answers });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchExamSubmissions = createAsyncThunk(
  "exams/fetchExamSubmissions",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.EXAMS}/${id}/submissions`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const examsSlice = createSlice({
  name: "exams",
  initialState: {
    items: [],
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,
    detail: null,
    detailStatus: "idle",
    detailError: null,
    submissions: [],
    submissionsStatus: "idle",
    submissionsError: null,

    examForTaking: null,
    takingStatus: "idle",
    takingError: null,

    submitResult: null,
    submitStatus: "idle",
  },
  reducers: {
    clearExamDetail: (state) => {
      state.detail = null;
      state.detailStatus = "idle";
      state.submissions = [];
      state.submissionsStatus = "idle";
    },
    clearExamTaking: (state) => {
      state.examForTaking = null;
      state.takingStatus = "idle";
      state.takingError = null;
      state.submitResult = null;
      state.submitStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamsByCourse.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchExamsByCourse.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchExamsByCourse.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.items.unshift({ ...action.payload, _count: { exam_questions: 0 } });
      })
      .addCase(fetchExamDetail.pending, (state) => {
        state.detailStatus = "loading";
      })
      .addCase(fetchExamDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchExamDetail.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
        if (state.detail?.id === action.payload.id) {
          state.detail = { ...state.detail, ...action.payload };
        }
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      })
      .addCase(fetchExamSubmissions.pending, (state) => {
        state.submissionsStatus = "loading";
      })
      .addCase(fetchExamSubmissions.fulfilled, (state, action) => {
        state.submissionsStatus = "succeeded";
        state.submissions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchExamSubmissions.rejected, (state, action) => {
        state.submissionsStatus = "failed";
        state.submissionsError = action.payload;
      })

      .addCase(fetchExamForTaking.pending, (state) => {
        state.takingStatus = "loading";
      })
      .addCase(fetchExamForTaking.fulfilled, (state, action) => {
        state.takingStatus = "succeeded";
        state.examForTaking = action.payload;
      })
      .addCase(fetchExamForTaking.rejected, (state, action) => {
        state.takingStatus = "failed";
        state.takingError = action.payload;
      })

      .addCase(submitExam.pending, (state) => {
        state.submitStatus = "loading";
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";
        state.submitResult = action.payload;
      })
      .addCase(submitExam.rejected, (state) => {
        state.submitStatus = "failed";
      });
  },
});

export const { clearExamDetail, clearExamTaking } = examsSlice.actions;
export default examsSlice.reducer;

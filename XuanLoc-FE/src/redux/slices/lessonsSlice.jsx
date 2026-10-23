import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchLessonsByCourse = createAsyncThunk(
  "lessons/fetchLessonsByCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.LESSONS}/course/${courseId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchClassLessonsProgress = createAsyncThunk(
  "lessons/fetchClassLessonsProgress",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.LESSONS}/class-progress/${classId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateClassLessonStatus = createAsyncThunk(
  "lessons/updateClassLessonStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.LESSONS}/update-progress`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addLessonMaterial = createAsyncThunk(
  "lessons/addLessonMaterial",
  async ({ lessonId, ...payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${ENDPOINTS.LESSONS}/${lessonId}/materials`, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteLessonMaterial = createAsyncThunk(
  "lessons/deleteLessonMaterial",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${ENDPOINTS.LESSONS}/materials/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const lessonsSlice = createSlice({
  name: "lessons",
  initialState: {
    items: [],
    listStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: null,

    progress: [],
    progressStatus: "idle",
    progressError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonsByCourse.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchLessonsByCourse.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLessonsByCourse.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })

      .addCase(fetchClassLessonsProgress.pending, (state) => {
        state.progressStatus = "loading";
      })
      .addCase(fetchClassLessonsProgress.fulfilled, (state, action) => {
        state.progressStatus = "succeeded";
        state.progress = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClassLessonsProgress.rejected, (state, action) => {
        state.progressStatus = "failed";
        state.progressError = action.payload;
      })
      .addCase(updateClassLessonStatus.fulfilled, (state, action) => {
        const idx = state.progress.findIndex((p) => p.lesson_id === action.payload.lesson_id);
        if (idx !== -1) state.progress[idx] = { ...state.progress[idx], ...action.payload };
        else state.progress.push(action.payload);
      })

      .addCase(addLessonMaterial.fulfilled, (state, action) => {
        const lesson = state.items.find((l) => l.id === action.payload.lesson_id);
        if (lesson) {
          lesson.lesson_materials = [...(lesson.lesson_materials || []), action.payload];
        }
      })
      .addCase(deleteLessonMaterial.fulfilled, (state, action) => {
        state.items.forEach((lesson) => {
          lesson.lesson_materials = (lesson.lesson_materials || []).filter((m) => m.id !== action.payload);
        });
      });
  },
});

export default lessonsSlice.reducer;

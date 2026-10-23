import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchPublicCourses = createAsyncThunk(
  "public/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.COURSES_PUBLIC);
      // axiosClient đã return response.data nên response ở đây chính là object của BE { status, statusCode, message, data }
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    // `condition` đọc state SỐNG tại thời điểm dispatch (khác useSelector trong effect - vốn
    // dùng giá trị đã "chụp" lúc render) - đây mới là cách chặn đúng khi nhiều component cùng
    // mount và cùng gọi dispatch trong cùng 1 tick (vd. FeaturedCourses + ConsultationForm).
    condition: (_, { getState }) => getState().public.coursesStatus !== "loading" && getState().public.coursesStatus !== "succeeded",
  },
);

export const fetchCourseDetail = createAsyncThunk(
  "public/fetchCourseDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.COURSES}/${id}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPublicClasses = createAsyncThunk(
  "public/fetchClasses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.CLASSES_PUBLIC);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => getState().public.classesStatus !== "loading" && getState().public.classesStatus !== "succeeded",
  },
);

export const fetchClassDetail = createAsyncThunk(
  "public/fetchClassDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.CLASSES}/${id}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchClassReviews = createAsyncThunk(
  "public/fetchClassReviews",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`${ENDPOINTS.REVIEWS_CLASS}/${classId}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const submitRegistration = createAsyncThunk(
  "public/submitRegistration",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        ENDPOINTS.COURSE_REGISTRATIONS,
        formData,
      );
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const publicSlice = createSlice({
  name: "public",
  initialState: {
    courses: [],
    coursesStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    coursesError: null,
    classes: [],
    classesStatus: "idle",
    classesError: null,
    courseDetail: null,
    courseDetailStatus: "idle",
    courseDetailError: null,
    classDetail: null,
    classDetailStatus: "idle",
    classDetailError: null,
    classReviews: [],
    classReviewsStatus: "idle",
    classReviewsError: null,
    submittingRegistration: false,
    registrationError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicCourses.pending, (state) => {
        state.coursesStatus = "loading";
      })
      .addCase(fetchPublicCourses.fulfilled, (state, action) => {
        state.coursesStatus = "succeeded";
        // Đảm bảo courses luôn là Array
        state.courses = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPublicCourses.rejected, (state, action) => {
        state.coursesStatus = "failed";
        state.coursesError = action.payload;
      })
      .addCase(fetchPublicClasses.pending, (state) => {
        state.classesStatus = "loading";
      })
      .addCase(fetchPublicClasses.fulfilled, (state, action) => {
        state.classesStatus = "succeeded";
        // Đảm bảo classes luôn là Array
        state.classes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPublicClasses.rejected, (state, action) => {
        state.classesStatus = "failed";
        state.classesError = action.payload;
      })
      .addCase(fetchCourseDetail.pending, (state) => {
        state.courseDetailStatus = "loading";
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.courseDetailStatus = "succeeded";
        state.courseDetail = action.payload;
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.courseDetailStatus = "failed";
        state.courseDetailError = action.payload;
      })
      .addCase(fetchClassDetail.pending, (state) => {
        state.classDetailStatus = "loading";
      })
      .addCase(fetchClassDetail.fulfilled, (state, action) => {
        state.classDetailStatus = "succeeded";
        state.classDetail = action.payload;
      })
      .addCase(fetchClassDetail.rejected, (state, action) => {
        state.classDetailStatus = "failed";
        state.classDetailError = action.payload;
      })
      .addCase(fetchClassReviews.pending, (state) => {
        state.classReviewsStatus = "loading";
      })
      .addCase(fetchClassReviews.fulfilled, (state, action) => {
        state.classReviewsStatus = "succeeded";
        state.classReviews = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClassReviews.rejected, (state, action) => {
        state.classReviewsStatus = "failed";
        state.classReviewsError = action.payload;
      })
      .addCase(submitRegistration.pending, (state) => {
        state.submittingRegistration = true;
      })
      .addCase(submitRegistration.fulfilled, (state) => {
        state.submittingRegistration = false;
        state.registrationError = null;
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.submittingRegistration = false;
        state.registrationError = action.payload;
      });
  },
});

export default publicSlice.reducer;

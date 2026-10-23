import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient.jsx";
import { ENDPOINTS } from "../../api/endpoints.jsx";

export const fetchStudentProfile = createAsyncThunk(
  "profile/fetchStudentProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.STUDENT_PROFILE);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateStudentProfile = createAsyncThunk(
  "profile/updateStudentProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(ENDPOINTS.STUDENT_PROFILE, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTeacherProfile = createAsyncThunk(
  "profile/fetchTeacherProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(ENDPOINTS.TEACHER_PROFILE);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTeacherProfile = createAsyncThunk(
  "profile/updateTeacherProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(ENDPOINTS.TEACHER_PROFILE, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const changeMyPassword = createAsyncThunk(
  "profile/changeMyPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(ENDPOINTS.CHANGE_PASSWORD, payload);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const uploadMyAvatar = createAsyncThunk(
  "profile/uploadMyAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      // Content-Type: undefined -> để trình duyệt tự set multipart/form-data kèm boundary,
      // ghi đè header mặc định "application/json" của axiosClient.
      const response = await axiosClient.patch(ENDPOINTS.AVATAR, formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    savingStatus: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        // BE chỉ trả về row student_details (không kèm full_name/phone/avatar_url nằm ở bảng
        // users) - phải tự lấy các trường đó từ payload gửi lên (action.meta.arg) để đồng bộ,
        // đồng thời gộp đúng vào state.data.student_details thay vì đè phẳng lên state.data
        // (row student_details có field `id` riêng, đè lên sẽ làm sai id của user).
        if (!state.data) return;
        const { full_name, phone, avatar_url } = action.meta.arg;
        if (full_name) state.data.full_name = full_name;
        if (phone) state.data.phone = phone;
        if (avatar_url) state.data.avatar_url = avatar_url;
        state.data.student_details = { ...state.data.student_details, ...action.payload };
      })

      .addCase(fetchTeacherProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeacherProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchTeacherProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateTeacherProfile.fulfilled, (state, action) => {
        // Tương tự updateStudentProfile: BE chỉ trả về row teacher_details.
        if (!state.data) return;
        const { full_name, phone, avatar_url } = action.meta.arg;
        if (full_name) state.data.full_name = full_name;
        if (phone) state.data.phone = phone;
        if (avatar_url) state.data.avatar_url = avatar_url;
        state.data.teacher_details = { ...state.data.teacher_details, ...action.payload };
      })

      .addCase(uploadMyAvatar.fulfilled, (state, action) => {
        if (state.data) state.data.avatar_url = action.payload.avatar_url;
      });
  },
});

export default profileSlice.reducer;

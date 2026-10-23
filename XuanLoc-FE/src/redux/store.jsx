import { configureStore } from '@reduxjs/toolkit';
import publicReducer from './slices/publicSlice.jsx';
import authReducer from './slices/authSlice.jsx';
import coursesReducer from './slices/coursesSlice.jsx';
import dashboardReducer from './slices/dashboardSlice.jsx';
import settingsReducer from './slices/settingsSlice.jsx';
import usersReducer from './slices/usersSlice.jsx';
import registrationsReducer from './slices/registrationsSlice.jsx';
import classesReducer from './slices/classesSlice.jsx';
import enrollmentsReducer from './slices/enrollmentsSlice.jsx';
import payrollReducer from './slices/payrollSlice.jsx';
import reviewsReducer from './slices/reviewsSlice.jsx';
import certificatesReducer from './slices/certificatesSlice.jsx';
import examsReducer from './slices/examsSlice.jsx';
import auditLogsReducer from './slices/auditLogsSlice.jsx';
import attendanceReducer from './slices/attendanceSlice.jsx';
import scheduleReducer from './slices/scheduleSlice.jsx';
import gradesReducer from './slices/gradesSlice.jsx';
import profileReducer from './slices/profileSlice.jsx';
import lessonsReducer from './slices/lessonsSlice.jsx';

export const store = configureStore({
  reducer: {
    public: publicReducer,
    auth: authReducer,
    courses: coursesReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
    users: usersReducer,
    registrations: registrationsReducer,
    classes: classesReducer,
    enrollments: enrollmentsReducer,
    payroll: payrollReducer,
    reviews: reviewsReducer,
    certificates: certificatesReducer,
    exams: examsReducer,
    auditLogs: auditLogsReducer,
    attendance: attendanceReducer,
    schedule: scheduleReducer,
    grades: gradesReducer,
    profile: profileReducer,
    lessons: lessonsReducer,
  },
});
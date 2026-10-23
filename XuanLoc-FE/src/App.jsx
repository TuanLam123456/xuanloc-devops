import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseDetailPage from "./pages/public/Courses/CourseDetailPage.jsx";
import { ToastContainer } from "react-toastify";
import AuthGate from "./common/components/AuthGate/AuthGate.jsx";
import ProtectedRoute from "./common/components/ProtectedRoute/ProtectedRoute.jsx";
import { ROLES } from "./common/constants/roles.js";
import PublicLayout from "./layouts/PublicLayout.jsx";
import HomePage from "./pages/public/Home/HomePage.jsx";
import LoginPage from "./pages/auth/Login/LoginPage.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/Dashboard/AdminDashboardPage.jsx";
import AdminCoursesPage from "./pages/admin/Courses/AdminCoursesPage.jsx";
import AdminSettingsPage from "./pages/admin/Settings/AdminSettingsPage.jsx";
import AdminUsersPage from "./pages/admin/Users/AdminUsersPage.jsx";
import AdminRegistrationsPage from "./pages/admin/Registrations/AdminRegistrationsPage.jsx";
import AdminClassesPage from "./pages/admin/Classes/AdminClassesPage.jsx";
import AdminEnrollmentsPage from "./pages/admin/Enrollments/AdminEnrollmentsPage.jsx";
import AdminPayrollPage from "./pages/admin/Payroll/AdminPayrollPage.jsx";
import AdminReviewsPage from "./pages/admin/Reviews/AdminReviewsPage.jsx";
import AdminCertificatesPage from "./pages/admin/Certificates/AdminCertificatesPage.jsx";
import AdminExamsPage from "./pages/admin/Exams/AdminExamsPage.jsx";
import AdminAuditLogsPage from "./pages/admin/AuditLogs/AdminAuditLogsPage.jsx";
import TeacherLayout from "./layouts/TeacherLayout.jsx";
import TeacherDashboardPage from "./pages/teacher/Dashboard/TeacherDashboardPage.jsx";
import TeacherClassesPage from "./pages/teacher/Classes/TeacherClassesPage.jsx";
import TeacherSchedulePage from "./pages/teacher/Schedule/TeacherSchedulePage.jsx";
import TeacherAttendancePage from "./pages/teacher/Attendance/TeacherAttendancePage.jsx";
import TeacherGradesPage from "./pages/teacher/Grades/TeacherGradesPage.jsx";
import TeacherLessonsPage from "./pages/teacher/Lessons/TeacherLessonsPage.jsx";
import TeacherExamsPage from "./pages/teacher/Exams/TeacherExamsPage.jsx";
import TeacherPayrollPage from "./pages/teacher/Payroll/TeacherPayrollPage.jsx";
import TeacherProfilePage from "./pages/teacher/Profile/TeacherProfilePage.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";
import StudentDashboardPage from "./pages/student/Dashboard/StudentDashboardPage.jsx";
import StudentClassesPage from "./pages/student/Classes/StudentClassesPage.jsx";
import StudentSchedulePage from "./pages/student/Schedule/StudentSchedulePage.jsx";
import StudentAttendancePage from "./pages/student/Attendance/StudentAttendancePage.jsx";
import StudentGradesPage from "./pages/student/Grades/StudentGradesPage.jsx";
import StudentExamsPage from "./pages/student/Exams/StudentExamsPage.jsx";
import StudentCertificatesPage from "./pages/student/Certificates/StudentCertificatesPage.jsx";
import StudentProfilePage from "./pages/student/Profile/StudentProfilePage.jsx";
import CoursesPage from "./pages/public/Courses/CoursePage.jsx";
import ClassesPage from "./pages/public/Classes/ClassesPage.jsx";
import ClassDetailPage from "./pages/public/Classes/ClassDetailPage.jsx";
import VerifyCertificatePage from "./pages/public/VerifyCertificate/VerifyCertificatePage";
import ForgotPasswordPage from './pages/auth/ForgotPassword/ForgotPasswordPage';
import NotFoundPage from './pages/public/NotFound/NotFoundPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route
              path="verify-certificate"
              element={<VerifyCertificatePage />}
            />
            <Route
              path="verify-certificate/:code"
              element={<VerifyCertificatePage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="registrations" element={<AdminRegistrationsPage />} />
              <Route path="classes" element={<AdminClassesPage />} />
              <Route path="enrollments" element={<AdminEnrollmentsPage />} />
              <Route path="payroll" element={<AdminPayrollPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="exams" element={<AdminExamsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboardPage />} />
              <Route path="classes" element={<TeacherClassesPage />} />
              <Route path="schedule" element={<TeacherSchedulePage />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="grades" element={<TeacherGradesPage />} />
              <Route path="lessons" element={<TeacherLessonsPage />} />
              <Route path="exams" element={<TeacherExamsPage />} />
              <Route path="payroll" element={<TeacherPayrollPage />} />
              <Route path="profile" element={<TeacherProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="classes" element={<StudentClassesPage />} />
              <Route path="schedule" element={<StudentSchedulePage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="grades" element={<StudentGradesPage />} />
              <Route path="exams" element={<StudentExamsPage />} />
              <Route path="certificates" element={<StudentCertificatesPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthGate>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;

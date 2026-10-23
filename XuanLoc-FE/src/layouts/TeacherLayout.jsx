import { Outlet } from 'react-router-dom';
import TeachersNavbar from '@/common/components/navbar/Teachers/TeachersNavbar.jsx';
import Sidebar from '@/common/components/Sidebar/Sidebar.jsx';

const navItems = [
  { label: 'Tổng quan', path: '/teacher', icon: 'bi-speedometer2' },
  { label: 'Lớp tôi dạy', path: '/teacher/classes', icon: 'bi-easel' },
  { label: 'Lịch dạy', path: '/teacher/schedule', icon: 'bi-calendar-week' },
  { label: 'Điểm danh', path: '/teacher/attendance', icon: 'bi-clipboard-check' },
  { label: 'Nhập điểm', path: '/teacher/grades', icon: 'bi-bar-chart' },
  { label: 'Bài giảng & Tài liệu', path: '/teacher/lessons', icon: 'bi-journal-text' },
  { label: 'Đề thi', path: '/teacher/exams', icon: 'bi-patch-question' },
  { label: 'Lương của tôi', path: '/teacher/payroll', icon: 'bi-wallet2' },
  { label: 'Hồ sơ cá nhân', path: '/teacher/profile', icon: 'bi-person-circle' },
];

const TeacherLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <TeachersNavbar />
      <div className="d-flex flex-grow-1">
        <Sidebar navItems={navItems} />
        <main className="flex-grow-1 bg-light p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;

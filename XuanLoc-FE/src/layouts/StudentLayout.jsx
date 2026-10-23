import { Outlet } from 'react-router-dom';
import StudentsNavbar from '@/common/components/navbar/Students/StudentsNavbar.jsx';
import Sidebar from '@/common/components/Sidebar/Sidebar.jsx';

const navItems = [
  { label: 'Tổng quan', path: '/student', icon: 'bi-speedometer2' },
  { label: 'Lớp học của tôi', path: '/student/classes', icon: 'bi-easel' },
  { label: 'Lịch học', path: '/student/schedule', icon: 'bi-calendar-week' },
  { label: 'Điểm danh', path: '/student/attendance', icon: 'bi-clipboard-check' },
  { label: 'Điểm số', path: '/student/grades', icon: 'bi-bar-chart' },
  { label: 'Đề thi', path: '/student/exams', icon: 'bi-patch-question' },
  { label: 'Chứng chỉ', path: '/student/certificates', icon: 'bi-award' },
  { label: 'Hồ sơ cá nhân', path: '/student/profile', icon: 'bi-person-circle' },
];

const StudentLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <StudentsNavbar />
      <div className="d-flex flex-grow-1">
        <Sidebar navItems={navItems} />
        <main className="flex-grow-1 bg-light p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

import { Outlet } from 'react-router-dom';
import AdminNavbar from '@/common/components/navbar/Admin/AdminNavbar.jsx';
import Sidebar from '@/common/components/Sidebar/Sidebar.jsx';

const navItems = [
  { label: 'Tổng quan', path: '/admin', icon: 'bi-speedometer2' },
  { label: 'Khóa học', path: '/admin/courses', icon: 'bi-mortarboard' },
  { label: 'Danh mục', path: '/admin/settings', icon: 'bi-door-open' },
  { label: 'Người dùng', path: '/admin/users', icon: 'bi-people' },
  { label: 'Tư vấn/CRM', path: '/admin/registrations', icon: 'bi-telephone' },
  { label: 'Lớp học', path: '/admin/classes', icon: 'bi-easel' },
  { label: 'Ghi danh & Học phí', path: '/admin/enrollments', icon: 'bi-cash-coin' },
  { label: 'Bảng lương', path: '/admin/payroll', icon: 'bi-wallet2' },
  { label: 'Đánh giá', path: '/admin/reviews', icon: 'bi-star' },
  { label: 'Chứng chỉ', path: '/admin/certificates', icon: 'bi-award' },
  { label: 'Đề thi', path: '/admin/exams', icon: 'bi-patch-question' },
  { label: 'Nhật ký hoạt động', path: '/admin/audit-logs', icon: 'bi-clock-history' },
];

const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminNavbar />
      <div className="d-flex flex-grow-1">
        <Sidebar navItems={navItems} />
        <main className="flex-grow-1 bg-light p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

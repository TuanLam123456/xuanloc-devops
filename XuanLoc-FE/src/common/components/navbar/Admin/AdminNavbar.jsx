import { Navbar, Container } from 'react-bootstrap';
import { Button, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/slices/authSlice.jsx';
import { getInitials } from '@/common/utils/getInitials.js';

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <Navbar bg="white" className="shadow-sm py-2 border-bottom">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/admin" className="d-flex align-items-center gap-2">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <i className="bi bi-mortarboard-fill fs-5" aria-hidden="true"></i>
          </div>
          <div>
            <div className="fw-bold text-primary lh-1 fs-5">XUÂN LỘC</div>
            <small className="text-muted" style={{ fontSize: '11px' }}>Quản trị viên</small>
          </div>
        </Navbar.Brand>

        <Space size="middle" className="ms-auto">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '36px', height: '36px', fontSize: '13px' }}
            >
              {getInitials(user?.full_name, 'AD')}
            </div>
            <span className="fw-medium text-dark d-none d-md-inline">{user?.full_name}</span>
          </div>
          <Button icon={<i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Space>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;

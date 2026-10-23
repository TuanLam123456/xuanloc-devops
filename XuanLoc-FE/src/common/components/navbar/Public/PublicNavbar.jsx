import { Navbar, Nav, Container } from "react-bootstrap";
import { Button, Space } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useScrollToConsultation } from "@/common/hooks/useScrollToConsultation.js";
import { ROLE_HOME_PATHS } from "@/common/constants/roles.js";

const PublicNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToConsultation = useScrollToConsultation();
  const user = useSelector((state) => state.auth.user);

  const navLinks = [
    { title: "Trang chủ", path: "/" },
    { title: "Khóa học", path: "/courses" },
    { title: "Lớp học sắp mở", path: "/classes" },
    { title: "Xác minh chứng chỉ", path: "/verify-certificate" },
  ];

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="white"
      sticky="top"
      className="shadow-sm py-2"
    >
      <Container>
        {/* Brand / Logo */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2"
        >
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-mortarboard-fill fs-5" aria-hidden="true"></i>
          </div>
          <div>
            <div className="fw-bold text-primary lh-1 fs-5">XUÂN LỘC</div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              Trung Tâm Ngoại Ngữ
            </small>
          </div>
        </Navbar.Brand>

        {/* Nút Toggle Mobile */}
        <Navbar.Toggle aria-controls="public-navbar-nav" />

        <Navbar.Collapse id="public-navbar-nav">
          {/* Navigation Links - Thêm text-nowrap để không bao giờ bị xuống dòng */}
          <Nav className="mx-auto my-2 my-lg-0 gap-lg-1">
            {navLinks.map((item) => (
              <Nav.Link
                key={item.path}
                eventKey={item.path}
                as={Link}
                to={item.path}
                className={`px-2 px-xl-3 py-2 rounded-2 fw-medium text-nowrap ${
                  location.pathname === item.path
                    ? "text-primary bg-primary-subtle"
                    : "text-secondary"
                }`}
              >
                {item.title}
              </Nav.Link>
            ))}
            <Nav.Link
              as="button"
              type="button"
              onClick={scrollToConsultation}
              className="px-2 px-xl-3 py-2 rounded-2 fw-medium text-secondary border-0 bg-transparent text-nowrap"
            >
              Tư vấn ghi danh
            </Nav.Link>
          </Nav>

          {/* Action Buttons */}
          <Space className="pt-2 pt-lg-0">
            {user ? (
              <Button
                type="primary"
                shape="round"
                icon={
                  <i className="bi bi-speedometer2 me-1" aria-hidden="true"></i>
                }
                onClick={() => navigate(ROLE_HOME_PATHS[user.role])}
              >
                Vào hệ thống
              </Button>
            ) : (
              <>
                <Button
                  icon={
                    <i
                      className="bi bi-box-arrow-in-right me-1"
                      aria-hidden="true"
                    ></i>
                  }
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  icon={
                    <i
                      className="bi bi-telephone-fill me-1"
                      aria-hidden="true"
                    ></i>
                  }
                  onClick={scrollToConsultation}
                  size="middle"
                >
                  Nhận tư vấn
                </Button>
              </>
            )}
          </Space>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PublicNavbar;
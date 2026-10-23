import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <Container>
        <Row className="gy-4">
          {/* Thông tin trung tâm */}
          <Col lg={4} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-mortarboard-fill" aria-hidden="true"></i>
              </div>
              <span className="fw-bold fs-5">XUÂN LỘC</span>
            </div>
            <p className="text-secondary small">
              Trung tâm Ngoại ngữ Xuân Lộc - Đào tạo tiếng Anh chuyên nghiệp từ cơ bản đến nâng cao.
            </p>
          </Col>

          {/* Khóa học */}
          <Col lg={4} md={6}>
            <h6 className="fw-bold mb-3 text-uppercase text-light">Khóa học</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/courses" className="text-secondary text-decoration-none">
                  Tiếng Anh Giao Tiếp
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/courses" className="text-secondary text-decoration-none">
                  Luyện thi IELTS / TOEIC
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/courses" className="text-secondary text-decoration-none">
                  Tiếng Anh Thiếu Nhi
                </Link>
              </li>
            </ul>
          </Col>

          {/* Liên hệ */}
          <Col lg={4} md={12}>
            <h6 className="fw-bold mb-3 text-uppercase text-light">Liên hệ</h6>
            <p className="text-secondary small mb-2">
              <i className="bi bi-geo-alt-fill me-2 text-primary" aria-hidden="true"></i>Xuân Lộc, Đồng Nai
            </p>
            <p className="text-secondary small mb-2">
              <i className="bi bi-telephone-fill me-2 text-primary" aria-hidden="true"></i>0988 123 456
            </p>
            <p className="text-secondary small">
              <i className="bi bi-envelope-fill me-2 text-primary" aria-hidden="true"></i>info@xuanloc.edu.vn
            </p>
          </Col>
        </Row>

        <hr className="border-secondary my-4" />
        <div className="text-center text-secondary small">
          © {new Date().getFullYear()} Trung Tâm Ngoại Ngữ Xuân Lộc. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
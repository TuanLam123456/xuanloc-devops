import { Container, Row, Col } from 'react-bootstrap';
import { Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useScrollToConsultation } from '@/common/hooks/useScrollToConsultation.js';

const HeroBanner = () => {
  const navigate = useNavigate();
  const scrollToConsultation = useScrollToConsultation();

  return (
    <div className="bg-light py-5 border-bottom overflow-hidden">
      <Container className="py-4">
        <Row className="align-items-center gy-4">
          <Col lg={7} className="animate__animated animate__fadeInLeft">
            <span className="badge bg-primary-subtle text-primary mb-3 px-3 py-2 rounded-pill fw-semibold animate__animated animate__fadeInDown animate__delay-1s">
              <i className="bi bi-stars me-1" aria-hidden="true"></i> Trung Tâm Ngoại Ngữ Hàng Đầu Xuân Lộc
            </span>
            <h1 className="display-5 fw-bold text-dark mb-3">
              Chắp Cánh Tương Lai Với <span className="text-primary">Tiếng Anh Toàn Diện</span>
            </h1>
            <p className="lead text-secondary mb-4">
              Chương trình đào tạo chuẩn quốc tế từ Giao tiếp cơ bản đến Luyện thi IELTS/TOEIC, cam kết lộ trình rõ ràng và đội ngũ giáo viên tận tâm.
            </p>
            <Space size="middle" wrap className="animate__animated animate__fadeInUp animate__delay-1s">
              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<i className="bi bi-mortarboard-fill me-1" aria-hidden="true"></i>}
                onClick={() => navigate('/courses')}
              >
                Khám phá khóa học
              </Button>
              <Button
                size="large"
                shape="round"
                icon={<i className="bi bi-chat-dots-fill me-1" aria-hidden="true"></i>}
                onClick={scrollToConsultation}
              >
                Đăng ký tư vấn ngay
              </Button>
            </Space>
          </Col>

          <Col lg={5} className="text-center animate__animated animate__fadeInRight">
            <div className="p-4 bg-white rounded-4 shadow-sm border hover-lift">
              <i className="bi bi-globe-americas text-primary d-inline-block animate__animated animate__pulse animate__infinite animate__slower" style={{ fontSize: '6.5rem' }} aria-hidden="true"></i>
              <h5 className="fw-bold mt-3 mb-1 text-dark">Môi Trường Học Chuẩn Quốc Tế</h5>
              <p className="text-muted small mb-0">Học trực quan, phương pháp giảng dạy hiện đại</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroBanner;
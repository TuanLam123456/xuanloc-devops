import { Container, Row, Col } from 'react-bootstrap';
import StepCardItem from './StepCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const STEPS = [
  {
    stepNumber: 1,
    title: 'Đăng Ký Tư Vấn',
    desc: 'Điền thông tin vào biểu mẫu trực tuyến hoặc liên hệ trực tiếp hotline trung tâm.',
    icon: 'bi-pencil-square',
    delay: '0s',
  },
  {
    stepNumber: 2,
    title: 'Kiểm Tra Trình Độ',
    desc: 'Làm bài test 4 kỹ năng miễn phí để xác định chính xác trình độ đầu vào hiện tại.',
    icon: 'bi-clipboard-check',
    delay: '0.15s',
  },
  {
    stepNumber: 3,
    title: 'Tư Vấn & Xếp Lớp',
    desc: 'Nhận lộ trình học tập cá nhân hóa, lựa chọn khung giờ và hoàn tất ghi danh.',
    icon: 'bi-calendar-check',
    delay: '0.3s',
  },
  {
    stepNumber: 4,
    title: 'Bắt Đầu Học Tập',
    desc: 'Nhận tài liệu, giáo trình chuẩn và chính thức tham gia buổi học đầu tiên.',
    icon: 'bi-mortarboard',
    delay: '0.45s',
  },
];

const AdmissionProcess = () => {
  return (
    <section className="py-5 bg-white border-bottom overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold text-uppercase small tracking-wide">
              Lộ trình đơn giản
            </span>
            <h2 className="fw-bold text-dark mt-1 mb-2">Quy Trình Nhập Học 4 Bước</h2>
            <p className="text-muted small">
              Bắt đầu hành trình chinh phục tiếng Anh dễ dàng và nhanh chóng
            </p>
          </div>
        </AnimateOnScroll>

        {/* 4 Steps Grid */}
        <Row className="gy-4 align-items-stretch">
          {STEPS.map((item) => (
            <Col lg={3} sm={6} key={item.stepNumber} className="d-flex flex-column">
              <AnimateOnScroll
                animation="animate__fadeInUp"
                delay={item.delay}
                className="h-100"
              >
                <div className="hover-lift h-100">
                  <StepCardItem {...item} />
                </div>
              </AnimateOnScroll>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default AdmissionProcess;
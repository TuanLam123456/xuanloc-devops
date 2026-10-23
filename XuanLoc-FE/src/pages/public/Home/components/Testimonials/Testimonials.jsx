import { Container, Row, Col } from 'react-bootstrap';
import TestimonialCardItem from './TestimonialCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Trần Thị B',
    courseTarget: 'Khóa IELTS Intensive',
    achievement: 'IELTS 7.0',
    comment:
      'Lộ trình học tại trung tâm rất rõ ràng. Thầy cô chỉnh từng bài Writing và Speaking rất chi tiết giúp em tự tin bứt phá điểm số sau 4 tháng.',
    color: '#0958d9',
  },
  {
    id: 2,
    name: 'Bùi Văn Tuấn Lâm',
    courseTarget: 'Khóa TOEIC Mastery',
    achievement: 'TOEIC 820',
    comment:
      'Các mẹo bắt từ khóa phần Listening và kỹ năng xử lý Part 7 của thầy cô cực kỳ hiệu quả, giúp mình vượt xa mục tiêu ban đầu để kịp ra trường.',
    color: '#389e0d',
  },
  {
    id: 3,
    name: 'Lê Minh Anh',
    courseTarget: 'Khóa Giao Tiếp Phản Xạ',
    achievement: 'Tự tin đàm thoại',
    comment:
      'Môi trường học rất vui và năng động. Sau khóa học mình đã vượt qua nỗi sợ nói tiếng Anh và tự tin phỏng vấn việc làm tại công ty nước ngoài.',
    color: '#d46b08',
  },
];

const Testimonials = () => {
  return (
    <section className="py-5 bg-light border-bottom overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold text-uppercase small tracking-wide">
              Câu chuyện thành công
            </span>
            <h2 className="fw-bold text-dark mt-1 mb-2">Cảm Nhận Từ Học Viên</h2>
            <p className="text-muted small">
              Thành quả và trải nghiệm thực tế từ các thế hệ học viên tại Trung tâm
            </p>
          </div>
        </AnimateOnScroll>

        {/* Testimonials List */}
        <Row className="gy-4 align-items-stretch">
          {TESTIMONIALS.map((item, index) => (
            <Col lg={4} md={6} key={item.id} className="d-flex flex-column">
              <AnimateOnScroll
                animation="animate__fadeInUp"
                delay={`${index * 0.15}s`}
                className="h-100"
              >
                <div className="hover-lift h-100">
                  <TestimonialCardItem {...item} />
                </div>
              </AnimateOnScroll>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Testimonials;
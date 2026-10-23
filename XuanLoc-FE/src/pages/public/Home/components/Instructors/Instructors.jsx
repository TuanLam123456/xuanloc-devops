import { Container, Row, Col } from 'react-bootstrap';
import InstructorCardItem from './InstructorCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const INSTRUCTORS = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    degree: 'Thạc sĩ TESOL',
    role: 'Giảng viên IELTS 8.5',
    bio: 'Hơn 8 năm kinh nghiệm giảng dạy và luyện thi chứng chỉ quốc tế Cambridge, IELTS.',
  },
  {
    id: 2,
    name: 'Lê Hoàng Mai',
    degree: 'Cử nhân Ngôn Ngữ Anh',
    role: 'Chuyên gia TOEIC 950 & Giao tiếp',
    bio: 'Phương pháp giảng dạy phản xạ trực quan, truyền cảm hứng tự tin nói tiếng Anh.',
  },
  {
    id: 3,
    name: 'David Miller',
    degree: 'CELTA Certified',
    role: 'Giảng viên Bản ngữ (UK)',
    bio: 'Chuyên gia chỉnh âm, chuẩn hóa phát âm IPA và phản xạ giao tiếp đời sống thực tế.',
  },
];

const Instructors = () => {
  return (
    <section className="py-5 bg-white border-bottom overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold text-uppercase small tracking-wide">
              Đội ngũ chuyên môn
            </span>
            <h2 className="fw-bold text-dark mt-1 mb-2">Đội Ngũ Giảng Viên Tâm Huyết</h2>
            <p className="text-muted small">
              100% giảng viên sở hữu chứng chỉ quốc tế và bề dày kinh nghiệm thực tế
            </p>
          </div>
        </AnimateOnScroll>

        {/* Instructors List */}
        <Row className="gy-4 align-items-stretch">
          {INSTRUCTORS.map((item, index) => (
            <Col lg={4} md={6} key={item.id} className="d-flex flex-column">
              <AnimateOnScroll
                animation="animate__fadeInUp"
                delay={`${index * 0.15}s`}
                className="h-100"
              >
                <div className="hover-lift h-100">
                  <InstructorCardItem {...item} />
                </div>
              </AnimateOnScroll>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Instructors;
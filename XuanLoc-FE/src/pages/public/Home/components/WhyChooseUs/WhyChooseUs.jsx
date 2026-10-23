import { Container, Row, Col } from 'react-bootstrap';
import FeatureCardItem from './FeatureCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const FEATURES = [
  {
    id: 1,
    icon: 'bi-person-gear',
    tagColor: 'primary',
    title: 'Lộ Trình Cá Nhân Hóa',
    desc: 'Thiết kế chương trình học riêng biệt dựa trên kết quả kiểm tra năng lực đầu vào và mục tiêu chứng chỉ.',
    delay: '0s',
  },
  {
    id: 2,
    icon: 'bi-people',
    tagColor: 'success',
    title: 'Sĩ Số Giới Hạn (10-12 bạn)',
    desc: 'Đảm bảo mỗi học viên đều được tương tác trực tiếp, chỉnh phát âm và sửa lỗi chi tiết trong từng buổi.',
    delay: '0.15s',
  },
  {
    id: 3,
    icon: 'bi-shield-check',
    tagColor: 'danger',
    title: 'Cam Kết Chuẩn Đầu Ra',
    desc: 'Hỗ trợ học lại hoàn toàn miễn phí nếu học viên tham gia đầy đủ và làm bài tập theo quy định.',
    delay: '0.3s',
  },
  {
    id: 4,
    icon: 'bi-laptop',
    tagColor: 'warning',
    title: 'Cơ Sở Vật Chất Hiện Đại',
    desc: 'Hệ thống phòng Lab chuyên dụng, Studio nghe nhìn chuẩn quốc tế cùng kho học liệu số phong phú.',
    delay: '0.45s',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-5 bg-light border-bottom overflow-hidden">
      <Container>
        {/* Header có hiệu ứng trượt nhẹ */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold text-uppercase small tracking-wide">
              Giá trị khác biệt
            </span>
            <h2 className="fw-bold text-dark mt-1 mb-2">Tại Sao Nên Chọn Ngoại Ngữ Xuân Lộc?</h2>
            <p className="text-muted small">Môi trường học tập chuyên nghiệp kiến tạo sự tự tin và bứt phá điểm số</p>
          </div>
        </AnimateOnScroll>

        {/* Danh sách Card trồi lên so le */}
        <Row className="gy-4">
          {FEATURES.map((item) => (
            <Col lg={3} sm={6} key={item.id}>
              <AnimateOnScroll animation="animate__fadeInUp" delay={item.delay}>
                <FeatureCardItem {...item} />
              </AnimateOnScroll>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
import { Container, Row, Col } from 'react-bootstrap';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const STATS_DATA = [
  { id: 1, number: '98%', label: 'Học viên đạt chuẩn đầu ra', icon: 'bi-trophy-fill', color: 'text-warning', delay: '0s' },
  { id: 2, number: '1.200+', label: 'Học viên đã tốt nghiệp', icon: 'bi-people-fill', color: 'text-primary', delay: '0.15s' },
  { id: 3, number: '100%', label: 'Giảng viên đạt chuẩn TESOL / 8.0+', icon: 'bi-patch-check-fill', color: 'text-success', delay: '0.3s' },
  { id: 4, number: '8+', label: 'Năm kinh nghiệm đào tạo', icon: 'bi-mortarboard-fill', color: 'text-info', delay: '0.45s' },
];

const StatsCounter = () => {
  return (
    <section className="py-4 bg-white border-bottom shadow-sm">
      <Container>
        <Row className="gy-4 text-center">
          {STATS_DATA.map((item) => (
            <Col lg={3} sm={6} key={item.id}>
              <AnimateOnScroll animation="animate__fadeInUp" delay={item.delay}>
                <div className="p-3 rounded-3 hover-lift">
                  <i className={`bi ${item.icon} ${item.color} fs-1 mb-2 d-inline-block`} aria-hidden="true"></i>
                  <h2 className="fw-bold text-dark mb-1">{item.number}</h2>
                  <p className="text-secondary small mb-0">{item.label}</p>
                </div>
              </AnimateOnScroll>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default StatsCounter;
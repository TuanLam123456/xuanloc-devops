import { Container, Row, Col } from 'react-bootstrap';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page py-5 bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={7} md={9} className="text-center">
            <AnimateOnScroll animation="animate__fadeInUp">
              <Result
                status="404"
                title="404"
                subTitle="Xin lỗi, trang bạn tìm không tồn tại hoặc đã được di chuyển."
                extra={
                  <Button type="primary" size="large" shape="round" onClick={() => navigate('/')}>
                    Về Trang Chủ
                  </Button>
                }
              />
            </AnimateOnScroll>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFoundPage;

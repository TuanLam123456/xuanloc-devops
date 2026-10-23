import { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Button, Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublicClasses } from '@/redux/slices/publicSlice.jsx';
import ClassCardItem from './ClassCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const UpcomingClasses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useSelector((state) => state.public.classes);
  const classesStatus = useSelector((state) => state.public.classesStatus);
  const classesError = useSelector((state) => state.public.classesError);

  useEffect(() => {
    if (classesStatus === 'idle') {
      dispatch(fetchPublicClasses());
    }
  }, [dispatch, classesStatus]);

  useEffect(() => {
    if (classesStatus === 'failed' && classesError) {
      toast.error(classesError || 'Không thể tải danh sách lớp học.');
    }
  }, [classesStatus, classesError]);

  const loadingClasses = classesStatus === 'loading';

  return (
    <section className="py-5 bg-light border-bottom overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-2 border-bottom">
            <div className="mb-3 mb-md-0">
              <span className="text-primary fw-semibold text-uppercase small tracking-wide">
                Lịch tuyển sinh
              </span>
              <h2 className="fw-bold text-dark mb-1 mt-1">Lớp Học Sắp Khai Giảng</h2>
              <p className="text-muted small mb-0">
                Đăng ký giữ chỗ sớm để nhận ưu đãi học phí và xếp lớp phù hợp
              </p>
            </div>

            <Button
              type="primary"
              ghost
              shape="round"
              className="d-inline-flex align-items-center fw-medium px-3 shadow-sm align-self-start align-self-md-auto"
              onClick={() => navigate('/classes')}
            >
              <span>Xem tất cả lịch mở lớp</span>
              <i className="bi bi-arrow-right ms-2 fs-6" aria-hidden="true"></i>
            </Button>
          </div>
        </AnimateOnScroll>

        {/* Classes List */}
        {loadingClasses ? (
          <div className="text-center py-5"><Spin size="large" /></div>
        ) : classes.length === 0 ? (
          <Empty description={classesStatus === 'failed' ? 'Không thể tải danh sách lớp học' : 'Hiện chưa có lịch lớp tuyển sinh mới'} />
        ) : (
          <Row className="gy-4 align-items-stretch">
            {classes.slice(0, 3).map((cls, index) => (
              <Col lg={4} md={6} key={cls.id} className="d-flex flex-column">
                <AnimateOnScroll
                  animation="animate__fadeInUp"
                  delay={`${index * 0.15}s`}
                  className="h-100"
                >
                  <div className="hover-lift h-100">
                    <ClassCardItem cls={cls} />
                  </div>
                </AnimateOnScroll>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default UpcomingClasses;

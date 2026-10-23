import { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Button, Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublicCourses } from '@/redux/slices/publicSlice.jsx';
import CourseCardItem from './CourseCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const FeaturedCourses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.public.courses);
  const coursesStatus = useSelector((state) => state.public.coursesStatus);
  const coursesError = useSelector((state) => state.public.coursesError);

  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchPublicCourses());
    }
  }, [dispatch, coursesStatus]);

  useEffect(() => {
    if (coursesStatus === 'failed' && coursesError) {
      toast.error(coursesError || 'Không thể tải danh sách khóa học.');
    }
  }, [coursesStatus, coursesError]);

  const loadingCourses = coursesStatus === 'loading';

  return (
    <section className="py-5 bg-white border-bottom overflow-hidden">
      <Container>
        {/* Header Section */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-2 border-bottom">
            <div className="mb-3 mb-md-0">
              <span className="text-primary fw-semibold text-uppercase small tracking-wide">
                Chương trình đào tạo
              </span>
              <h2 className="fw-bold text-dark mb-1 mt-1">Khóa Học Nổi Bật</h2>
              <p className="text-muted small mb-0">
                Lộ trình học bài bản được thiết kế cho từng độ tuổi và mục tiêu
              </p>
            </div>

            <Button
              type="primary"
              ghost
              shape="round"
              className="d-inline-flex align-items-center fw-medium px-3 shadow-sm align-self-start align-self-md-auto"
              onClick={() => navigate('/courses')}
            >
              <span>Xem tất cả khóa học</span>
              <i className="bi bi-arrow-right ms-2 fs-6" aria-hidden="true"></i>
            </Button>
          </div>
        </AnimateOnScroll>

        {/* Courses List */}
        {loadingCourses ? (
          <div className="text-center py-5"><Spin size="large" /></div>
        ) : courses.length === 0 ? (
          <Empty description={coursesStatus === 'failed' ? 'Không thể tải danh sách khóa học' : 'Hiện chưa có khóa học mới'} />
        ) : (
          <Row className="gy-4 align-items-stretch">
            {courses.slice(0, 3).map((course, index) => (
              <Col lg={4} md={6} key={course.id} className="d-flex flex-column">
                <AnimateOnScroll
                  animation="animate__fadeInUp"
                  delay={`${index * 0.15}s`}
                  className="h-100"
                >
                  <div className="hover-lift h-100">
                    <CourseCardItem course={course} />
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

export default FeaturedCourses;

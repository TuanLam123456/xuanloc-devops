import { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, Empty } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useScrollToConsultation } from '@/common/hooks/useScrollToConsultation.js';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';
import { fetchCourseDetail } from '@/redux/slices/publicSlice.jsx';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollToConsultation = useScrollToConsultation();

  const course = useSelector((state) => state.public.courseDetail);
  const status = useSelector((state) => state.public.courseDetailStatus);
  const loading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (!id) return;
    dispatch(fetchCourseDetail(id)).then((resultAction) => {
      if (!fetchCourseDetail.fulfilled.match(resultAction)) {
        toast.error(resultAction.payload || 'Không thể tải thông tin chi tiết khóa học.');
      }
    });
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="text-center py-5 min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <Container className="py-5 text-center min-vh-100 d-flex flex-column justify-content-center">
        <Empty description="Không tìm thấy thông tin khóa học" />
        <div className="mt-3">
          <Button type="primary" onClick={() => navigate('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="course-detail-page py-5 bg-light min-vh-100">
      <Container>
        {/* Nút quay lại */}
        <div className="mb-4">
          <Button
            icon={<i className="bi bi-arrow-left me-1" aria-hidden="true"></i>}
            onClick={() => navigate('/courses')}
            className="rounded-pill px-3 shadow-sm"
          >
            Quay lại khóa học
          </Button>
        </div>

        <Row className="gy-4">
          {/* Cột thông tin chính */}
          <Col lg={8}>
            <AnimateOnScroll animation="animate__fadeInLeft">
              <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
                <div className="mb-3">
                  <Tag color="blue" className="px-3 py-1 fw-bold fs-6">
                    {course.code || 'KHÓA HỌC'}
                  </Tag>
                  {course.duration_months && (
                    <Tag color="cyan" className="px-3 py-1 fw-semibold">
                      Thời lượng: {course.duration_months} tháng
                    </Tag>
                  )}
                </div>

                <h1 className="fw-bold text-dark mb-3">{course.title}</h1>
                <p className="text-secondary mb-4" style={{ lineHeight: '1.8' }}>
                  {course.description || 'Chương trình đào tạo chuẩn quốc tế giúp phát triển toàn diện các kỹ năng nghe, nói, đọc, viết.'}
                </p>

                <hr className="text-muted opacity-25 my-4" />

                <h4 className="fw-bold text-dark mb-3">Nội Dung & Bài Học Trong Khóa</h4>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {course.lessons.map((lesson, idx) => (
                      <div key={lesson.id || idx} className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
                        <div>
                          <span className="badge bg-primary-subtle text-primary me-3">Bài {idx + 1}</span>
                          <span className="fw-medium text-dark">{lesson.title}</span>
                        </div>
                        <small className="text-muted">{lesson.duration_hours ? `${lesson.duration_hours} giờ` : ''}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small fst-italic">Đang cập nhật danh sách bài học chi tiết.</p>
                )}
              </Card>
            </AnimateOnScroll>
          </Col>

          {/* Cột sidebar đăng ký & học phí */}
          <Col lg={4}>
            <AnimateOnScroll animation="animate__fadeInRight">
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <div className="text-center mb-4">
                  <small className="text-muted d-block text-uppercase fw-semibold mb-1">Học phí trọn gói</small>
                  <h2 className="text-danger fw-bold mb-0">
                    {Number.isFinite(Number(course.tuition_fee)) && course.tuition_fee != null
                      ? `${Number(course.tuition_fee).toLocaleString('vi-VN')} đ`
                      : 'Liên hệ'}
                  </h2>
                </div>

                <div className="d-grid gap-3 mb-4">
                  <Button
                    type="primary"
                    size="large"
                    shape="round"
                    icon={<i className="bi bi-telephone-fill me-1" aria-hidden="true"></i>}
                    onClick={scrollToConsultation}
                    block
                  >
                    Đăng Ký Tư Vấn Ngay
                  </Button>
                </div>

                <div className="border-top pt-3 small text-secondary">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2 fs-5" aria-hidden="true"></i>
                    <span>Cam kết chuẩn đầu ra ngoại ngữ</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2 fs-5" aria-hidden="true"></i>
                    <span>Tài liệu học tập & giáo trình chuẩn</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2 fs-5" aria-hidden="true"></i>
                    <span>Hỗ trợ giải đáp 24/7 cùng giảng viên</span>
                  </div>
                </div>
              </Card>
            </AnimateOnScroll>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseDetailPage;
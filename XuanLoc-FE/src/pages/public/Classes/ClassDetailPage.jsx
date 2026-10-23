import { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, Empty, Rate } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useScrollToConsultation } from '@/common/hooks/useScrollToConsultation.js';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';
import { getInitials } from '@/common/utils/getInitials.js';
import { fetchClassDetail, fetchClassReviews } from '@/redux/slices/publicSlice.jsx';

const ClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollToConsultation = useScrollToConsultation();

  const classData = useSelector((state) => state.public.classDetail);
  const status = useSelector((state) => state.public.classDetailStatus);
  const loading = status === 'idle' || status === 'loading';

  const reviews = useSelector((state) => state.public.classReviews);
  const reviewsStatus = useSelector((state) => state.public.classReviewsStatus);
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  useEffect(() => {
    if (!id) return;
    dispatch(fetchClassDetail(id)).then((resultAction) => {
      if (!fetchClassDetail.fulfilled.match(resultAction)) {
        toast.error(resultAction.payload || 'Không thể tải thông tin chi tiết lớp học.');
      }
    });
  }, [id, dispatch]);

  // Đánh giá là nội dung phụ, tải lỗi thì bỏ qua chứ không toast chặn trang chi tiết chính
  useEffect(() => {
    if (!id) return;
    dispatch(fetchClassReviews(id));
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="text-center py-5 min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <Spin size="large" />
      </div>
    );
  }

  if (!classData) {
    return (
      <Container className="py-5 text-center min-vh-100 d-flex flex-column justify-content-center">
        <Empty description="Không tìm thấy thông tin lớp học" />
        <div className="mt-3">
          <Button type="primary" onClick={() => navigate('/classes')}>
            Quay lại lịch tuyển sinh
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="class-detail-page py-5 bg-light min-vh-100">
      <Container>
        {/* Nút quay lại */}
        <div className="mb-4">
          <Button
            icon={<i className="bi bi-arrow-left me-1" aria-hidden="true"></i>}
            onClick={() => navigate('/classes')}
            className="rounded-pill px-3 shadow-sm"
          >
            Quay lại lịch tuyển sinh
          </Button>
        </div>

        <Row className="gy-4">
          {/* Cột thông tin chi tiết lớp */}
          <Col lg={8}>
            <AnimateOnScroll animation="animate__fadeInLeft">
              <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
                <div className="mb-3 d-flex gap-2">
                  <Tag color="geekblue" className="px-3 py-1 fw-bold">
                    {classData.courses?.code || 'LỚP HỌC'}
                  </Tag>
                  <Tag color="cyan" className="px-3 py-1 fw-semibold">
                    <i className="bi bi-door-open-fill me-1" aria-hidden="true"></i>
                    {classData.room || 'Phòng học chuẩn'}
                  </Tag>
                </div>

                <h1 className="fw-bold text-dark mb-3">{classData.class_name}</h1>
                <p className="text-muted mb-4">
                  Thuộc chương trình đào tạo: <strong className="text-dark">{classData.courses?.title}</strong>
                </p>

                <hr className="text-muted opacity-25 my-4" />

                <h4 className="fw-bold text-dark mb-3">Thông Tin Lịch Học & Khai Giảng</h4>
                <div className="bg-light rounded-4 p-4 mb-4">
                  <Row className="gy-3">
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Ngày khai giảng dự kiến</div>
                      <div className="fw-bold text-dark fs-5">
                        {classData.start_date ? new Date(classData.start_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Lịch học hàng tuần</div>
                      <div className="fw-bold text-dark fs-5">
                        {classData.schedule_text || 'Theo lịch trung tâm'}
                      </div>
                    </Col>
                  </Row>
                </div>

                <h5 className="fw-bold text-dark mb-2">Giới thiệu khóa học tương ứng</h5>
                <p className="text-secondary small mb-0">
                  {classData.courses?.description || 'Lớp học được giảng dạy theo lộ trình chuẩn, sĩ số giới hạn giúp tương tác tối đa.'}
                </p>
              </Card>
            </AnimateOnScroll>

            {/* Đánh giá thật từ học viên đã học lớp này */}
            <AnimateOnScroll animation="animate__fadeInLeft">
              <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mt-4">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <h4 className="fw-bold text-dark mb-0">Đánh Giá Từ Học Viên</h4>
                  {reviews.length > 0 && (
                    <div className="d-flex align-items-center gap-2">
                      <Rate disabled allowHalf value={avgRating} className="fs-6 text-warning" />
                      <span className="fw-bold text-dark">{avgRating.toFixed(1)}</span>
                      <span className="text-muted small">({reviews.length} đánh giá)</span>
                    </div>
                  )}
                </div>

                {reviewsStatus === 'loading' && (
                  <div className="text-center py-3">
                    <Spin />
                  </div>
                )}

                {reviewsStatus !== 'loading' && reviews.length === 0 && (
                  <p className="text-muted small fst-italic mb-0">Chưa có đánh giá nào cho lớp học này.</p>
                )}

                {reviews.length > 0 && (
                  <div className="d-flex flex-column gap-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="d-flex gap-3 pb-3 border-bottom">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                          style={{ width: '42px', height: '42px', backgroundColor: '#1677ff', fontSize: '14px' }}
                        >
                          {getInitials(review.users?.full_name, 'HV')}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                            <span className="fw-semibold text-dark">{review.users?.full_name || 'Học viên'}</span>
                            <Rate disabled value={review.rating} style={{ fontSize: '14px' }} className="text-warning" />
                          </div>
                          {review.comment && (
                            <p className="text-secondary small fst-italic mb-0 mt-1">&ldquo;{review.comment}&rdquo;</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </AnimateOnScroll>
          </Col>

          {/* Cột sidebar giữ chỗ */}
          <Col lg={4}>
            <AnimateOnScroll animation="animate__fadeInRight">
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <div className="text-center mb-4">
                  <span className="badge bg-success-subtle text-success border border-success-subtle mb-2 px-3 py-1 rounded-pill">
                    Đang nhận đăng ký giữ chỗ
                  </span>
                  <h4 className="fw-bold text-dark mb-1">{classData.class_name}</h4>
                  <p className="text-muted small mb-0">Nhanh tay đăng ký để nhận ưu đãi</p>
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
                    Đăng Ký Giữ Chỗ Ngay
                  </Button>
                </div>

                <div className="border-top pt-3 small text-secondary">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-info-circle-fill text-primary me-2" aria-hidden="true"></i>
                    <span>Sĩ số giới hạn 10-12 học viên/lớp</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gift-fill text-danger me-2" aria-hidden="true"></i>
                    <span>Tặng kèm bộ tài liệu học tập chuyên sâu</span>
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

export default ClassDetailPage;
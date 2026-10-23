import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Spin, Empty, Input, Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublicClasses } from '@/redux/slices/publicSlice.jsx';
import ClassCardItem from '../Home/components/UpcomingClasses/ClassCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const PAGE_SIZE = 6; // Cố định 6 lớp học mỗi trang

const ClassesPage = () => {
  const dispatch = useDispatch();
  const classes = useSelector((state) => state.public.classes);
  const classesStatus = useSelector((state) => state.public.classesStatus);
  const classesError = useSelector((state) => state.public.classesError);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  // 1. Lọc lớp học theo từ khóa tìm kiếm (tên lớp, tên khóa học hoặc mã khóa học)
  const filteredClasses = classes.filter((cls) => {
    const term = searchTerm.toLowerCase();
    return (
      cls.class_name?.toLowerCase().includes(term) ||
      cls.courses?.title?.toLowerCase().includes(term) ||
      cls.courses?.code?.toLowerCase().includes(term) ||
      cls.room?.toLowerCase().includes(term)
    );
  });

  // Khi gõ tìm kiếm, tự động reset về trang 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 2. Cắt mảng dữ liệu phân trang (6 items / trang)
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentClasses = filteredClasses.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="classes-page py-5 bg-light min-vh-100 d-flex flex-column">
      <Container className="flex-grow-1">
        {/* Header Tiêu đề trang */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold text-uppercase small tracking-wide">
              Lịch tuyển sinh chi tiết
            </span>
            <h1 className="fw-bold text-dark mt-1 mb-2">Lớp Học Sắp Khai Giảng</h1>
            <p className="text-muted small mx-auto" style={{ maxWidth: '600px' }}>
              Cập nhật liên tục các lớp học ngoại ngữ mới nhất. Đăng ký giữ chỗ sớm để nhận ưu đãi học phí và chọn khung giờ phù hợp.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Thanh tìm kiếm (Filter) */}
        <AnimateOnScroll animation="animate__fadeInUp" className="mb-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Input
                size="large"
                placeholder="Tìm kiếm theo tên lớp, khóa học hoặc phòng học..."
                prefix={<i className="bi bi-search text-muted me-2" aria-hidden="true"></i>}
                value={searchTerm}
                onChange={handleSearchChange}
                allowClear
                className="rounded-pill shadow-sm py-2 px-3"
              />
            </Col>
          </Row>
        </AnimateOnScroll>

        {/* Nội dung danh sách lớp học */}
        {loadingClasses ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm p-5">
            <Empty description={classesStatus === 'failed' ? 'Không thể tải danh sách lớp học' : 'Không tìm thấy lớp học phù hợp'} />
          </div>
        ) : (
          <>
            <Row className="gy-4 align-items-stretch">
              {currentClasses.map((cls, index) => (
                <Col lg={4} md={6} key={cls.id} className="d-flex flex-column">
                  <AnimateOnScroll
                    animation="animate__fadeInUp"
                    delay={`${(index % 3) * 0.15}s`}
                    className="h-100"
                  >
                    <div className="hover-lift h-100">
                      <ClassCardItem cls={cls} />
                    </div>
                  </AnimateOnScroll>
                </Col>
              ))}
            </Row>

            {/* Phân trang (Pagination) */}
            <div className="d-flex justify-content-center mt-5">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={filteredClasses.length}
                onChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default ClassesPage;
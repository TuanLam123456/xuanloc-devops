import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Spin, Empty, Input, Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPublicCourses } from '@/redux/slices/publicSlice.jsx';
import CourseCardItem from '../Home/components/FeaturedCourses/CourseCardItem.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const PAGE_SIZE = 6; // Cố định 6 courses mỗi trang

const CoursesPage = () => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.public.courses);
  const coursesStatus = useSelector((state) => state.public.coursesStatus);
  const coursesError = useSelector((state) => state.public.coursesError);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  // 1. Lọc khóa học theo từ khóa tìm kiếm (mã hoặc tên khóa học)
  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();
    return (
      course.title?.toLowerCase().includes(term) ||
      course.code?.toLowerCase().includes(term) ||
      course.description?.toLowerCase().includes(term)
    );
  });

  // Khi người dùng gõ tìm kiếm, tự động reset về trang 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 2. Cắt mảng dữ liệu phân trang (6 items / trang)
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="courses-page py-5 bg-light min-vh-100 d-flex flex-column">
      <Container className="flex-grow-1">
        {/* Header Tiêu đề trang */}
        <AnimateOnScroll animation="animate__fadeInDown">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold text-uppercase small tracking-wide">
              Chương trình đào tạo chuyên sâu
            </span>
            <h1 className="fw-bold text-dark mt-1 mb-2">Tất Cả Khóa Học Ngoại Ngữ</h1>
            <p className="text-muted small mx-auto" style={{ maxWidth: '600px' }}>
              Khám phá các lộ trình học tập chuẩn quốc tế từ Giao tiếp cơ bản đến luyện thi chứng chỉ IELTS, TOEIC giúp bạn bứt phá năng lực.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Thanh tìm kiếm (Filter) */}
        <AnimateOnScroll animation="animate__fadeInUp" className="mb-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Input
                size="large"
                placeholder="Tìm kiếm theo tên hoặc mã khóa học..."
                prefix={<i className="bi bi-search text-muted me-2" aria-hidden="true"></i>}
                value={searchTerm}
                onChange={handleSearchChange}
                allowClear
                className="rounded-pill shadow-sm py-2 px-3"
              />
            </Col>
          </Row>
        </AnimateOnScroll>

        {/* Nội dung danh sách khóa học */}
        {loadingCourses ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm p-5">
            <Empty description={coursesStatus === 'failed' ? 'Không thể tải danh sách khóa học' : 'Không tìm thấy khóa học phù hợp'} />
          </div>
        ) : (
          <>
            <Row className="gy-4 align-items-stretch">
              {currentCourses.map((course, index) => (
                <Col lg={4} md={6} key={course.id} className="d-flex flex-column">
                  <AnimateOnScroll
                    animation="animate__fadeInUp"
                    delay={`${(index % 3) * 0.15}s`}
                    className="h-100"
                  >
                    <div className="hover-lift h-100">
                      <CourseCardItem course={course} />
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
                total={filteredCourses.length}
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

export default CoursesPage;
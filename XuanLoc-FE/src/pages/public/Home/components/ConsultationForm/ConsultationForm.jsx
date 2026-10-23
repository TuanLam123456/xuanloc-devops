import { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Button } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCourses, submitRegistration } from '@/redux/slices/publicSlice.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const ConsultationForm = () => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.public.courses);
  const coursesStatus = useSelector((state) => state.public.coursesStatus);
  const submittingRegistration = useSelector((state) => state.public.submittingRegistration);

  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchPublicCourses());
    }
  }, [dispatch, coursesStatus]);

  const formik = useFormik({
    initialValues: { course_id: '', full_name: '', email: '', phone: '', note: '' },
    validationSchema: Yup.object({
      course_id: Yup.string().required('Vui lòng chọn khóa học cần tư vấn'),
      full_name: Yup.string().max(100, 'Họ tên tối đa 100 ký tự').required('Họ và tên không được để trống'),
      email: Yup.string().email('Email không đúng định dạng').required('Email không được để trống'),
      phone: Yup.string().matches(/^[0-9]{10}$/, 'Số điện thoại gồm 10 chữ số').required('Vui lòng nhập số điện thoại'),
      note: Yup.string().max(500, 'Ghi chú tối đa 500 ký tự'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const resultAction = await dispatch(submitRegistration(values));
      if (submitRegistration.fulfilled.match(resultAction)) {
        toast.success('Gửi yêu cầu thành công! Trung tâm sẽ liên hệ sớm nhất.');
        resetForm();
      } else {
        toast.error(resultAction.payload || 'Không thể gửi đăng ký tư vấn.');
      }
    },
  });

  return (
    <section id="consultation-section" className="py-5 bg-white overflow-hidden">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <AnimateOnScroll animation="animate__zoomIn" duration="0.7s">
              <Card className="border-0 shadow-lg p-4 p-md-5 rounded-4">
                <div className="text-center mb-4">
                  <span className="text-primary fw-semibold text-uppercase small tracking-wide">
                    Hỗ trợ 24/7
                  </span>
                  <h3 className="fw-bold text-dark mt-1 mb-2">Đăng Ký Tư Vấn Miễn Phí</h3>
                  <p className="text-muted small mb-0">
                    Điền thông tin bên dưới để nhận lộ trình học tập cá nhân hóa và ưu đãi học phí tốt nhất
                  </p>
                </div>

                <form onSubmit={formik.handleSubmit}>
                  <Row className="g-3">
                    <Col md={12}>
                      <label className="form-label fw-medium small text-dark">Khóa học quan tâm *</label>
                      <select
                        name="course_id"
                        className={`form-select ${formik.touched.course_id && formik.errors.course_id ? 'is-invalid' : ''}`}
                        value={formik.values.course_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.code})
                          </option>
                        ))}
                      </select>
                      {formik.touched.course_id && formik.errors.course_id && (
                        <div className="invalid-feedback">{formik.errors.course_id}</div>
                      )}
                    </Col>

                    <Col md={6}>
                      <label className="form-label fw-medium small text-dark">Họ và tên *</label>
                      <input
                        type="text"
                        name="full_name"
                        placeholder="Nguyễn Văn A"
                        className={`form-control ${formik.touched.full_name && formik.errors.full_name ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('full_name')}
                      />
                      {formik.touched.full_name && formik.errors.full_name && (
                        <div className="invalid-feedback">{formik.errors.full_name}</div>
                      )}
                    </Col>

                    <Col md={6}>
                      <label className="form-label fw-medium small text-dark">Số điện thoại *</label>
                      <input
                        type="text"
                        name="phone"
                        placeholder="0988123456"
                        className={`form-control ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('phone')}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <div className="invalid-feedback">{formik.errors.phone}</div>
                      )}
                    </Col>

                    <Col md={12}>
                      <label className="form-label fw-medium small text-dark">Địa chỉ Email *</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('email')}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="invalid-feedback">{formik.errors.email}</div>
                      )}
                    </Col>

                    <Col md={12}>
                      <label className="form-label fw-medium small text-dark">Ghi chú thêm</label>
                      <textarea
                        name="note"
                        rows="3"
                        placeholder="Mục tiêu điểm số, trình độ hiện tại, khung giờ có thể học..."
                        className={`form-control ${formik.touched.note && formik.errors.note ? 'is-invalid' : ''}`}
                        {...formik.getFieldProps('note')}
                      ></textarea>
                      {formik.touched.note && formik.errors.note && (
                        <div className="invalid-feedback">{formik.errors.note}</div>
                      )}
                    </Col>

                    <Col md={12} className="text-center mt-4">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        shape="round"
                        loading={submittingRegistration}
                        block
                        className="fw-medium shadow-sm"
                      >
                        Gửi Yêu Cầu Tư Vấn Ngay
                      </Button>
                    </Col>
                  </Row>
                </form>
              </Card>
            </AnimateOnScroll>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ConsultationForm;
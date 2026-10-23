import { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosClient from '@/api/axiosClient.jsx';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & mật khẩu mới
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Form bước 1: Gửi yêu cầu quên mật khẩu (nhập email)
  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không đúng định dạng').required('Vui lòng nhập email'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axiosClient.post(ENDPOINTS.FORGOT_PASSWORD, { email: values.email });
        setSubmittedEmail(values.email);
        toast.success('Mã xác nhận (OTP) đã được gửi đến email của bạn.');
        setStep(2);
      } catch (err) {
        toast.error(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Form bước 2: Xác nhận mã OTP và đổi mật khẩu mới
  const resetFormik = useFormik({
    initialValues: { codeChangePass: '', newPassword: '' },
    validationSchema: Yup.object({
      codeChangePass: Yup.string().required('Vui lòng nhập mã xác nhận OTP'),
      newPassword: Yup.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên').required('Vui lòng nhập mật khẩu mới'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axiosClient.post(ENDPOINTS.RESET_PASSWORD_CODE, {
          email: submittedEmail,
          codeChangePass: values.codeChangePass,
          newPassword: values.newPassword,
        });
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } catch (err) {
        toast.error(err.message || 'Mã xác nhận không chính xác hoặc đã hết hạn.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <AnimateOnScroll animation="animate__zoomIn">
              <Card className="border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
                <div className="text-center mb-4">
                  <Link
                    to="/"
                    className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 shadow-sm"
                    style={{ width: '56px', height: '56px' }}
                  >
                    <i className="bi bi-key-fill fs-4" aria-hidden="true"></i>
                  </Link>
                  <h3 className="fw-bold text-dark mb-1">Khôi Phục Mật Khẩu</h3>
                  <p className="text-muted small mb-0">
                    {step === 1 ? 'Nhập email đăng ký để nhận mã OTP' : `Nhập mã OTP đã gửi tới ${submittedEmail}`}
                  </p>
                </div>

                {step === 1 ? (
                  <form onSubmit={emailFormik.handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-medium small text-dark">Địa chỉ Email</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        className={`form-control ${emailFormik.touched.email && emailFormik.errors.email ? 'is-invalid' : ''}`}
                        {...emailFormik.getFieldProps('email')}
                      />
                      {emailFormik.touched.email && emailFormik.errors.email && (
                        <div className="invalid-feedback">{emailFormik.errors.email}</div>
                      )}
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      shape="round"
                      loading={loading}
                      block
                      className="fw-medium shadow-sm mb-3"
                    >
                      Gửi Mã Xác Nhận
                    </Button>

                    <div className="text-center">
                      <Link to="/login" className="text-decoration-none small text-primary fw-medium">
                        <i className="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={resetFormik.handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium small text-dark">Mã xác nhận (OTP)</label>
                      <input
                        type="text"
                        name="codeChangePass"
                        placeholder="Nhập mã OTP"
                        className={`form-control ${resetFormik.touched.codeChangePass && resetFormik.errors.codeChangePass ? 'is-invalid' : ''}`}
                        {...resetFormik.getFieldProps('codeChangePass')}
                      />
                      {resetFormik.touched.codeChangePass && resetFormik.errors.codeChangePass && (
                        <div className="invalid-feedback">{resetFormik.errors.codeChangePass}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium small text-dark">Mật khẩu mới</label>
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="••••••••"
                        className={`form-control ${resetFormik.touched.newPassword && resetFormik.errors.newPassword ? 'is-invalid' : ''}`}
                        {...resetFormik.getFieldProps('newPassword')}
                      />
                      {resetFormik.touched.newPassword && resetFormik.errors.newPassword && (
                        <div className="invalid-feedback">{resetFormik.errors.newPassword}</div>
                      )}
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      shape="round"
                      loading={loading}
                      block
                      className="fw-medium shadow-sm mb-3"
                    >
                      Đặt Lại Mật Khẩu
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none small text-muted p-0 border-0 bg-transparent"
                        onClick={() => setStep(1)}
                      >
                        <i className="bi bi-arrow-left me-1"></i> Nhập lại email khác
                      </button>
                    </div>
                  </form>
                )}
              </Card>
            </AnimateOnScroll>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;
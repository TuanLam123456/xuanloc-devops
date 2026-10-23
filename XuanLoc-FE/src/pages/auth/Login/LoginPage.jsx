import { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { login } from '@/redux/slices/authSlice.jsx';
import { ROLE_HOME_PATHS } from '@/common/constants/roles.js';
import LoadingScreen from '@/common/components/LoadingScreen/LoadingScreen.jsx';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initialized, loginStatus } = useSelector((state) => state.auth);

  // Đã đăng nhập sẵn -> điều hướng đi luôn, ưu tiên quay lại trang định vào trước khi bị ProtectedRoute chặn.
  useEffect(() => {
    if (initialized && user) {
      const from = location.state?.from;
      const redirectTo = from
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : ROLE_HOME_PATHS[user.role];
      navigate(redirectTo, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không đúng định dạng').required('Vui lòng nhập email'),
      password: Yup.string().required('Vui lòng nhập mật khẩu'),
    }),
    onSubmit: async (values) => {
      const resultAction = await dispatch(login(values));
      if (!login.fulfilled.match(resultAction)) {
        toast.error(resultAction.payload || 'Đăng nhập thất bại.');
      }
    },
  });

  if (!initialized || user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="border-0 shadow-lg rounded-4 p-4 p-md-5">
              <div className="text-center mb-4">
                <Link
                  to="/"
                  className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                  style={{ width: '56px', height: '56px' }}
                >
                  <i className="bi bi-mortarboard-fill fs-3" aria-hidden="true"></i>
                </Link>
                <h3 className="fw-bold text-dark mb-1">Đăng Nhập Hệ Thống</h3>
                <p className="text-muted small mb-0">Trung tâm Ngoại ngữ Xuân Lộc</p>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium small text-dark">Email</label>
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
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small text-dark">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                    {...formik.getFieldProps('password')}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="invalid-feedback">{formik.errors.password}</div>
                  )}
                </div>

                <div className="mb-4 text-end">
                  <Link to="/forgot-password" style={{ fontSize: '13px' }} className="text-decoration-none">
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  shape="round"
                  loading={loginStatus === 'loading'}
                  block
                  className="fw-medium shadow-sm"
                >
                  Đăng Nhập
                </Button>
              </form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
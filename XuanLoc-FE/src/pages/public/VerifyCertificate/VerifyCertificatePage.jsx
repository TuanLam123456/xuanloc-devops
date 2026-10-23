import { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Input, Button, Spin, Result } from 'antd';
import { useParams } from 'react-router-dom';
import axiosClient from '@/api/axiosClient.jsx';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import AnimateOnScroll from '@/common/components/ScrollAnimation/AnimateOnScroll.jsx';

const VerifyCertificatePage = () => {
  const { code: urlCode } = useParams();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || inputCode;
    if (!code.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setCertData(null);

    try {
      // Gọi API xác minh chứng chỉ public từ Backend
      const res = await axiosClient.get(`${ENDPOINTS.CERTIFICATES}/verify/${code.trim()}`);
      setCertData(res.data || res);
    } catch (err) {
      setErrorMsg(err.message || 'Mã chứng chỉ không tồn tại hoặc không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-certificate-page py-5 bg-light min-vh-100 d-flex flex-column justify-content-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={7} md={9}>
            <AnimateOnScroll animation="animate__fadeInDown">
              <div className="text-center mb-4">
                <span className="text-primary fw-semibold text-uppercase small tracking-wide">
                  Hệ thống tra cứu văn bằng
                </span>
                <h1 className="fw-bold text-dark mt-1 mb-2">Xác Minh Chứng Chỉ</h1>
                <p className="text-muted small">
                  Nhập mã chứng chỉ để kiểm tra thông tin học viên và khóa học chính thức từ Trung Tâm Ngoại Ngữ Xuân Lộc
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="animate__fadeInUp">
              <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <div className="d-flex gap-2 mb-4">
                  <Input
                    size="large"
                    placeholder="Nhập mã chứng chỉ (VD: XL-2026-000001)..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    onPressEnter={() => handleVerify()}
                    className="rounded-start-pill py-2 px-3"
                  />
                  <Button
                    type="primary"
                    size="large"
                    className="rounded-end-pill px-4 fw-medium"
                    onClick={() => handleVerify()}
                    loading={loading}
                  >
                    Xác Minh
                  </Button>
                </div>

                {loading && (
                  <div className="text-center py-5">
                    <Spin size="large" />
                  </div>
                )}

                {/* Hiển thị kết quả thành công */}
                {certData && !loading && (
                  <div className="border border-success-subtle bg-success-subtle bg-opacity-10 rounded-4 p-4 mt-3">
                    <Result
                      status="success"
                      title="Chứng Chỉ Hợp Lệ & Chính Thức!"
                      subTitle={`Mã số: ${certData.certificate_code}`}
                      className="p-0"
                    />
                    <hr className="my-3 text-success opacity-25" />
                    <div className="row g-2 text-dark small">
                      <div className="col-sm-5 fw-semibold text-muted">Họ và tên học viên:</div>
                      <div className="col-sm-7 fw-bold">{certData.student_name}</div>

                      <div className="col-sm-5 fw-semibold text-muted">Khóa học hoàn thành:</div>
                      <div className="col-sm-7 fw-bold text-primary">{certData.course_title}</div>

                      <div className="col-sm-5 fw-semibold text-muted">Ngày cấp chứng nhận:</div>
                      <div className="col-sm-7">
                        {new Date(certData.issued_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hiển thị kết quả lỗi / không tìm thấy */}
                {errorMsg && !loading && (
                  <div className="mt-3">
                    <Result
                      status="error"
                      title="Không Tìm Thấy Chứng Chỉ"
                      subTitle={errorMsg}
                      className="p-0"
                    />
                  </div>
                )}
              </Card>
            </AnimateOnScroll>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifyCertificatePage;
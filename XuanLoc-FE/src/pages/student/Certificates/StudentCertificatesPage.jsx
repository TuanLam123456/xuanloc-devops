import { useEffect } from 'react';
import { Card, Row, Col, Button, Empty, Spin, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDate } from '@/common/utils/format.js';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import { fetchMyCertificates } from '@/redux/slices/certificatesSlice.jsx';

const StudentCertificatesPage = () => {
  const dispatch = useDispatch();
  const { myItems: items, myStatus } = useSelector((state) => state.certificates);
  const loading = myStatus === 'loading';

  useEffect(() => {
    dispatch(fetchMyCertificates());
  }, [dispatch]);

  useEffect(() => {
    if (myStatus === 'failed') toast.error('Không thể tải danh sách chứng chỉ.');
  }, [myStatus]);

  const handleDownload = (cert) => {
    window.open(`${import.meta.env.VITE_API_URL}${ENDPOINTS.CERTIFICATES}/${cert.id}/download`, '_blank');
  };

  const handleCopyVerifyLink = async (cert) => {
    const url = `${window.location.origin}/verify-certificate/${cert.certificate_code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết xác minh.');
    } catch {
      toast.error('Không thể sao chép. Mã chứng chỉ: ' + cert.certificate_code);
    }
  };

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Chứng Chỉ Của Tôi</h3>

      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Empty description="Bạn chưa được cấp chứng chỉ nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((cert) => (
            <Col xs={24} md={12} lg={8} key={cert.id}>
              <Card className="h-100 shadow-sm text-center">
                <i className="bi bi-award-fill text-warning" style={{ fontSize: 48 }} aria-hidden="true"></i>
                <h5 className="fw-bold mt-2 mb-1">{cert.enrollments?.classes?.courses?.title}</h5>
                <p className="text-muted small mb-1">Lớp: {cert.enrollments?.classes?.class_name}</p>
                <p className="text-muted small mb-3">
                  Mã: <strong>{cert.certificate_code}</strong> — Cấp ngày {formatDate(cert.issued_at)}
                </p>
                <Space>
                  <Button type="primary" onClick={() => handleDownload(cert)}>
                    Tải PDF
                  </Button>
                  <Button onClick={() => handleCopyVerifyLink(cert)}>Sao chép link xác minh</Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default StudentCertificatesPage;

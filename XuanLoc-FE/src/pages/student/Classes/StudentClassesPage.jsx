import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, Empty, Spin, Modal, Form, Select, Input, Rate } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/common/utils/format.js';
import { fetchPublicClasses } from '@/redux/slices/publicSlice.jsx';
import { fetchMyEnrollments, registerForClass, fetchTransferQr } from '@/redux/slices/enrollmentsSlice.jsx';
import { createReview } from '@/redux/slices/reviewsSlice.jsx';

const STATUS_LABELS = { active: 'Đang học', dropped: 'Đã nghỉ', completed: 'Đã hoàn thành' };
const STATUS_COLORS = { active: 'green', dropped: 'red', completed: 'blue' };

const StudentClassesPage = () => {
  const dispatch = useDispatch();
  const { myItems: enrollments, myStatus } = useSelector((state) => state.enrollments);
  const { classes: publicClasses, classesStatus } = useSelector((state) => state.public);
  const loading = myStatus === 'loading';

  const [registerModal, setRegisterModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewingClass, setReviewingClass] = useState(null);
  const [qrEnrollment, setQrEnrollment] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [registerForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const loadMyEnrollments = () => dispatch(fetchMyEnrollments());

  useEffect(() => {
    loadMyEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (myStatus === 'failed') toast.error('Không thể tải danh sách lớp học của bạn.');
  }, [myStatus]);

  const openRegisterModal = () => {
    setRegisterModal(true);
    dispatch(fetchPublicClasses());
  };

  const enrolledClassIds = new Set(enrollments.map((e) => e.class_id));
  const classOptions = publicClasses
    .filter((c) => !enrolledClassIds.has(c.id))
    .map((c) => ({
      value: c.id,
      label: `${c.class_name} — ${c.courses?.title || ''} (GV: ${c.users?.full_name || 'Chưa phân công'})`,
    }));

  const handleRegister = async () => {
    let values;
    try {
      values = await registerForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(registerForClass(values.class_id));
    setSubmitting(false);
    if (registerForClass.fulfilled.match(resultAction)) {
      toast.success(
        resultAction.payload?.waitlisted
          ? 'Lớp học đã đầy, bạn đã được thêm vào danh sách chờ.'
          : 'Đăng ký lớp học thành công.',
      );
      setRegisterModal(false);
      registerForm.resetFields();
      loadMyEnrollments();
    } else {
      toast.error(resultAction.payload || 'Không thể đăng ký lớp học.');
    }
  };

  const handleReview = async () => {
    let values;
    try {
      values = await reviewForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(
      createReview({ class_id: reviewingClass.class_id, rating: values.rating, comment: values.comment }),
    );
    setSubmitting(false);
    if (createReview.fulfilled.match(resultAction)) {
      toast.success('Gửi đánh giá thành công. Cảm ơn bạn!');
      setReviewingClass(null);
      reviewForm.resetFields();
    } else {
      toast.error(resultAction.payload || 'Không thể gửi đánh giá.');
    }
  };

  const handleOpenQr = async (e) => {
    setQrEnrollment(e);
    setQrData(null);
    setQrLoading(true);
    const resultAction = await dispatch(fetchTransferQr(e.id));
    setQrLoading(false);
    if (fetchTransferQr.fulfilled.match(resultAction)) {
      setQrData(resultAction.payload);
    } else {
      toast.error(resultAction.payload || 'Không thể tạo mã chuyển khoản.');
      setQrEnrollment(null);
    }
  };

  const totalPaid = (payments) => (payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const totalRefunded = (refunds) => (refunds || []).reduce((sum, r) => sum + Number(r.amount), 0);
  const balanceDue = (e) => {
    const tuition = Number(e.classes?.courses?.tuition_fee || 0);
    const discount = Number(e.discount_amount || 0);
    const netPaid = totalPaid(e.payments) - totalRefunded(e.refunds);
    return tuition - discount - netPaid;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Lớp Học Của Tôi</h3>
        <Button type="primary" onClick={openRegisterModal}>
          + Đăng ký lớp học mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : enrollments.length === 0 ? (
        <Empty description="Bạn chưa ghi danh vào lớp học nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {enrollments.map((e) => (
            <Col xs={24} md={12} lg={8} key={e.id}>
              <Card
                className="h-100 shadow-sm"
                title={e.classes?.class_name}
                extra={<Tag color={STATUS_COLORS[e.status]}>{STATUS_LABELS[e.status] || e.status}</Tag>}
              >
                <p className="text-muted mb-2">{e.classes?.courses?.title}</p>
                <div className="small mb-1">
                  <i className="bi bi-person-badge me-1" aria-hidden="true"></i>
                  GV: {e.classes?.users?.full_name || 'Chưa phân công'}
                </div>
                <div className="small mb-1">
                  <i className="bi bi-calendar-week me-1" aria-hidden="true"></i>
                  {e.classes?.schedule_text || 'Đang cập nhật lịch học'}
                </div>
                <div className="small mb-3">
                  <i className="bi bi-door-open me-1" aria-hidden="true"></i>
                  {e.classes?.room || 'Đang cập nhật phòng học'}
                </div>
                <div className="border-top pt-2 small">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Học phí:</span>
                    <span>{formatCurrency(e.classes?.courses?.tuition_fee)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Đã đóng:</span>
                    <span className="text-success">{formatCurrency(totalPaid(e.payments))}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Còn lại:</span>
                    <span className={balanceDue(e) > 0 ? 'text-danger' : 'text-success'}>
                      {formatCurrency(balanceDue(e))}
                    </span>
                  </div>
                </div>
                {balanceDue(e) > 0 && (
                  <Button size="small" type="primary" className="mt-3" block onClick={() => handleOpenQr(e)}>
                    Chuyển khoản QR
                  </Button>
                )}
                {e.status === 'completed' && (
                  <Button size="small" className="mt-2" block onClick={() => setReviewingClass(e)}>
                    Đánh giá lớp học
                  </Button>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Đăng ký lớp học mới"
        open={registerModal}
        onOk={handleRegister}
        onCancel={() => setRegisterModal(false)}
        confirmLoading={submitting}
        okText="Đăng ký"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={registerForm} layout="vertical">
          <Form.Item
            name="class_id"
            label="Chọn lớp học đang tuyển sinh"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
            help={classOptions.length === 0 && classesStatus === 'succeeded' ? 'Hiện không có lớp học mới nào để đăng ký.' : undefined}
          >
            <Select
              options={classOptions}
              loading={classesStatus === 'loading'}
              placeholder="Chọn lớp học"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Đánh giá — ${reviewingClass?.classes?.class_name || ''}`}
        open={!!reviewingClass}
        onOk={handleReview}
        onCancel={() => setReviewingClass(null)}
        confirmLoading={submitting}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={reviewForm} layout="vertical" initialValues={{ rating: 5 }}>
          <Form.Item name="rating" label="Số sao" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Nhận xét của bạn">
            <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm học tập của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chuyển khoản học phí — ${qrEnrollment?.classes?.class_name || ''}`}
        open={!!qrEnrollment}
        onCancel={() => setQrEnrollment(null)}
        footer={null}
        destroyOnHidden
      >
        {qrLoading ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : qrData ? (
          <div className="text-center">
            <img src={qrData.qr_url} alt="Mã VietQR chuyển khoản học phí" className="img-fluid mb-3" style={{ maxWidth: 280 }} />
            <div className="text-start small border-top pt-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Ngân hàng:</span>
                <span className="fw-semibold">{qrData.bank_display_name}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Số tài khoản:</span>
                <span className="fw-semibold">{qrData.bank_account_no}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Chủ tài khoản:</span>
                <span className="fw-semibold">{qrData.bank_account_name}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Số tiền:</span>
                <span className="fw-bold text-danger">{formatCurrency(qrData.amount)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Nội dung CK:</span>
                <span className="fw-semibold">{qrData.content}</span>
              </div>
            </div>
            <div className="alert alert-warning small mt-3 mb-0 text-start">
              Vui lòng giữ đúng nội dung chuyển khoản để trung tâm đối soát nhanh hơn. Sau khi chuyển khoản,
              hệ thống sẽ ghi nhận sau khi Admin xác nhận đã nhận được tiền, có thể mất một ít thời gian.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default StudentClassesPage;

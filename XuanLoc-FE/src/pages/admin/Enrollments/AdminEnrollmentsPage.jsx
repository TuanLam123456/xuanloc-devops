import { useEffect, useState } from 'react';
import { Table, Button, Select, Tag, Space, Modal, Form, Input, InputNumber, Popconfirm, Drawer, Tabs, Empty, Spin, Divider } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatCurrency, formatDate } from '@/common/utils/format.js';
import { ROLES } from '@/common/constants/roles.js';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import { fetchClasses } from '@/redux/slices/classesSlice.jsx';
import { fetchUsers } from '@/redux/slices/usersSlice.jsx';
import {
  fetchEnrollments,
  createEnrollment,
  updateEnrollmentStatus,
  deleteEnrollment,
  fetchEnrollmentBalance,
  setEnrollmentDiscount,
  applyVoucher,
  createCashPayment,
  fetchPayments,
  createRefund,
  fetchRefunds,
  fetchGradesByEnrollment,
  addGrade,
  issueCertificate,
  fetchDebtReport,
  sendTuitionReminders,
} from '@/redux/slices/enrollmentsSlice.jsx';

const STATUS_LABELS = { active: 'Đang học', dropped: 'Đã nghỉ', completed: 'Đã hoàn thành' };
const STATUS_COLORS = { active: 'green', dropped: 'red', completed: 'blue' };
const PAYMENT_METHOD_LABELS = { cash: 'Tiền mặt', transfer: 'Chuyển khoản' };

// ---------- Drawer chi tiết 1 ghi danh ----------
const EnrollmentDetailDrawer = ({ enrollment, onClose, onChanged }) => {
  const dispatch = useDispatch();
  const [balance, setBalance] = useState(null);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [discountModal, setDiscountModal] = useState(false);
  const [voucherModal, setVoucherModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);

  const [discountForm] = Form.useForm();
  const [voucherForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [gradeForm] = Form.useForm();

  const loadAll = async (id) => {
    setLoading(true);
    const [balAction, payAction, refAction, gradeAction] = await Promise.all([
      dispatch(fetchEnrollmentBalance(id)),
      dispatch(fetchPayments(id)),
      dispatch(fetchRefunds(id)),
      dispatch(fetchGradesByEnrollment(id)),
    ]);
    if (fetchEnrollmentBalance.fulfilled.match(balAction)) setBalance(balAction.payload);
    if (fetchPayments.fulfilled.match(payAction)) setPayments(payAction.payload);
    if (fetchRefunds.fulfilled.match(refAction)) setRefunds(refAction.payload);
    if (fetchGradesByEnrollment.fulfilled.match(gradeAction)) setGrades(gradeAction.payload);
    setLoading(false);
  };

  useEffect(() => {
    if (!enrollment) return;
    const timer = setTimeout(() => loadAll(enrollment.id), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?.id]);

  const handleDiscount = async () => {
    let values;
    try {
      values = await discountForm.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    const action = await dispatch(setEnrollmentDiscount({ id: enrollment.id, discount_amount: values.discount_amount }));
    setBusy(false);
    if (setEnrollmentDiscount.fulfilled.match(action)) {
      toast.success('Cập nhật miễn giảm thành công.');
      setDiscountModal(false);
      loadAll(enrollment.id);
      onChanged?.();
    } else {
      toast.error(action.payload || 'Không thể cập nhật miễn giảm.');
    }
  };

  const handleVoucher = async () => {
    let values;
    try {
      values = await voucherForm.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    const action = await dispatch(applyVoucher({ id: enrollment.id, code: values.code }));
    setBusy(false);
    if (applyVoucher.fulfilled.match(action)) {
      toast.success('Áp dụng voucher thành công.');
      setVoucherModal(false);
      loadAll(enrollment.id);
      onChanged?.();
    } else {
      toast.error(action.payload || 'Không thể áp dụng voucher.');
    }
  };

  const handlePayment = async () => {
    let values;
    try {
      values = await paymentForm.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    const action = await dispatch(createCashPayment({ enrollment_id: enrollment.id, ...values }));
    setBusy(false);
    if (createCashPayment.fulfilled.match(action)) {
      toast.success('Lập phiếu thu tiền thành công.');
      setPaymentModal(false);
      loadAll(enrollment.id);
      onChanged?.();
    } else {
      toast.error(action.payload || 'Không thể lập phiếu thu tiền.');
    }
  };

  const handleRefund = async () => {
    let values;
    try {
      values = await refundForm.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    const action = await dispatch(createRefund({ id: enrollment.id, ...values }));
    setBusy(false);
    if (createRefund.fulfilled.match(action)) {
      toast.success('Tạo phiếu hoàn tiền thành công.');
      setRefundModal(false);
      loadAll(enrollment.id);
      onChanged?.();
    } else {
      toast.error(action.payload || 'Không thể tạo phiếu hoàn tiền.');
    }
  };

  const handleGrade = async () => {
    let values;
    try {
      values = await gradeForm.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    const action = await dispatch(addGrade({ enrollment_id: enrollment.id, ...values }));
    setBusy(false);
    if (addGrade.fulfilled.match(action)) {
      toast.success('Đã thêm điểm.');
      setGradeModal(false);
      loadAll(enrollment.id);
    } else {
      toast.error(action.payload || 'Không thể thêm điểm.');
    }
  };

  const handleIssueCertificate = async () => {
    setBusy(true);
    const action = await dispatch(issueCertificate(enrollment.id));
    setBusy(false);
    if (issueCertificate.fulfilled.match(action)) {
      toast.success('Cấp chứng chỉ thành công.');
    } else {
      toast.error(action.payload || 'Không thể cấp chứng chỉ.');
    }
  };

  return (
    <Drawer title={`Chi tiết ghi danh — ${enrollment?.users?.full_name || ''}`} open={!!enrollment} onClose={onClose} size={560}>
      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : (
        enrollment && (
          <div>
            <h5 className="fw-bold">Học phí</h5>
            {balance && (
              <div className="mb-3">
                <div>Học phí gốc: {formatCurrency(balance.tuition_fee)}</div>
                <div>Miễn giảm: {formatCurrency(balance.discount_amount)}</div>
                <div>Đã đóng: {formatCurrency(balance.total_paid)}</div>
                <div>Đã hoàn: {formatCurrency(balance.total_refunded)}</div>
                <div className="fw-bold text-danger">Còn nợ: {formatCurrency(balance.balance_due)}</div>
              </div>
            )}
            <Space className="mb-3" wrap>
              <Button size="small" onClick={() => setDiscountModal(true)}>
                Miễn giảm
              </Button>
              <Button size="small" onClick={() => setVoucherModal(true)}>
                Áp voucher
              </Button>
              <Button size="small" type="primary" onClick={() => setPaymentModal(true)}>
                Ghi nhận thanh toán
              </Button>
              <Button size="small" danger onClick={() => setRefundModal(true)}>
                Hoàn tiền
              </Button>
              {enrollment.status === 'completed' && (
                <Popconfirm title="Cấp chứng chỉ cho học viên này?" okText="Cấp" cancelText="Hủy" onConfirm={handleIssueCertificate}>
                  <Button size="small" loading={busy}>
                    Cấp chứng chỉ
                  </Button>
                </Popconfirm>
              )}
            </Space>

            <Divider />
            <h5 className="fw-bold">Lịch sử thu tiền</h5>
            {payments.length === 0 ? (
              <Empty description="Chưa có phiếu thu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              payments.map((p) => (
                <div key={p.id} className="d-flex justify-content-between border-bottom py-1 small">
                  <span>{formatDate(p.payment_date)} — {PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}</span>
                  <span className="fw-semibold">{formatCurrency(p.amount_paid)}</span>
                </div>
              ))
            )}

            <Divider />
            <h5 className="fw-bold">Lịch sử hoàn tiền</h5>
            {refunds.length === 0 ? (
              <Empty description="Chưa có phiếu hoàn tiền" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              refunds.map((r) => (
                <div key={r.id} className="d-flex justify-content-between border-bottom py-1 small">
                  <span>{formatDate(r.refunded_at)} — {r.reason || '—'}</span>
                  <span className="fw-semibold">{formatCurrency(r.amount)}</span>
                </div>
              ))
            )}

            <Divider />
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold mb-0">Điểm</h5>
              <Button size="small" onClick={() => setGradeModal(true)}>
                + Thêm điểm
              </Button>
            </div>
            {grades.length === 0 ? (
              <Empty description="Chưa có điểm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              grades.map((g) => (
                <div key={g.id} className="border-bottom py-1 small">
                  <div className="d-flex justify-content-between">
                    <span>{g.title}</span>
                    <span className="fw-semibold">{g.score}/10</span>
                  </div>
                  {g.teacher_comment && <div className="text-muted">{g.teacher_comment}</div>}
                </div>
              ))
            )}
          </div>
        )
      )}

      <Modal title="Miễn giảm học phí" open={discountModal} onOk={handleDiscount} onCancel={() => setDiscountModal(false)} confirmLoading={busy} okText="Lưu" cancelText="Hủy" destroyOnHidden>
        <Form form={discountForm} layout="vertical" initialValues={{ discount_amount: enrollment?.discount_amount || 0 }}>
          <Form.Item name="discount_amount" label="Số tiền miễn giảm (đ)" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber min={0} step={100000} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Áp mã voucher" open={voucherModal} onOk={handleVoucher} onCancel={() => setVoucherModal(false)} confirmLoading={busy} okText="Áp dụng" cancelText="Hủy" destroyOnHidden>
        <Form form={voucherForm} layout="vertical">
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}>
            <Input placeholder="VD: WELCOME10" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Ghi nhận thanh toán" open={paymentModal} onOk={handlePayment} onCancel={() => setPaymentModal(false)} confirmLoading={busy} okText="Ghi nhận" cancelText="Hủy" destroyOnHidden>
        <Form form={paymentForm} layout="vertical" initialValues={{ payment_method: 'cash' }}>
          <Form.Item name="payment_method" label="Phương thức" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'cash', label: 'Tiền mặt' },
                { value: 'transfer', label: 'Chuyển khoản (đã nhận tiền vào tài khoản)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="amount_paid" label="Số tiền thu (đ)" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber min={1} step={100000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input placeholder="VD: nội dung chuyển khoản, mã giao dịch..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Hoàn tiền" open={refundModal} onOk={handleRefund} onCancel={() => setRefundModal(false)} confirmLoading={busy} okText="Hoàn tiền" okType="danger" cancelText="Hủy" destroyOnHidden>
        <Form form={refundForm} layout="vertical">
          <Form.Item name="amount" label="Số tiền hoàn (đ)" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber min={1} step={100000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Lý do">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Thêm điểm" open={gradeModal} onOk={handleGrade} onCancel={() => setGradeModal(false)} confirmLoading={busy} okText="Lưu điểm" cancelText="Hủy" destroyOnHidden>
        <Form form={gradeForm} layout="vertical">
          <Form.Item name="title" label="Tên bài thi/kiểm tra" rules={[{ required: true, message: 'Vui lòng nhập tên bài' }]}>
            <Input placeholder="VD: Kiểm tra giữa kỳ" />
          </Form.Item>
          <Form.Item name="score" label="Điểm (0-10)" rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}>
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="teacher_comment" label="Nhận xét">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

// ---------- Tab: Báo cáo công nợ ----------
const DebtReportTab = () => {
  const dispatch = useDispatch();
  const { items, loading, tableProps } = useServerTable({
    thunk: fetchDebtReport,
    selectItems: (state) => state.enrollments.debtItems,
    selectPagination: (state) => state.enrollments.debtPagination,
    selectStatus: (state) => state.enrollments.debtStatus,
    selectError: (state) => state.enrollments.debtError,
    errorMessage: 'Không thể tải báo cáo công nợ.',
  });
  const [sending, setSending] = useState(false);

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_URL}${ENDPOINTS.ENROLLMENTS}/debt-report/export`, '_blank');
  };

  const handleSendReminders = async () => {
    setSending(true);
    const action = await dispatch(sendTuitionReminders());
    setSending(false);
    if (sendTuitionReminders.fulfilled.match(action)) {
      toast.success(`Đã gửi ${action.payload.sent}/${action.payload.total} email nhắc học phí.`);
    } else {
      toast.error(action.payload || 'Không thể gửi email nhắc nhở.');
    }
  };

  const columns = [
    { title: 'Học viên', key: 'student', render: (_, r) => r.student?.full_name },
    { title: 'Lớp', key: 'class', render: (_, r) => r.class?.class_name },
    { title: 'Khóa học', key: 'course', render: (_, r) => r.course?.title },
    { title: 'Học phí', dataIndex: 'tuition_fee', render: formatCurrency },
    { title: 'Đã đóng', dataIndex: 'total_paid', render: formatCurrency },
    { title: 'Còn nợ', dataIndex: 'balance_due', render: (v) => <span className="fw-bold text-danger">{formatCurrency(v)}</span> },
  ];

  return (
    <div>
      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button onClick={handleExport}>Xuất Excel</Button>
        <Popconfirm title="Gửi email nhắc học phí cho toàn bộ học viên còn nợ?" okText="Gửi" cancelText="Hủy" onConfirm={handleSendReminders}>
          <Button type="primary" loading={sending}>
            Gửi nhắc nhở hàng loạt
          </Button>
        </Popconfirm>
      </div>
      <Table rowKey="enrollment_id" columns={columns} dataSource={items} loading={loading} {...tableProps} />
    </div>
  );
};

// ---------- Tab: Danh sách ghi danh ----------
const EnrollmentListTab = () => {
  const dispatch = useDispatch();
  const { items, loading, filters, setFilters, tableProps, refresh } = useServerTable({
    thunk: fetchEnrollments,
    selectItems: (state) => state.enrollments.items,
    selectPagination: (state) => state.enrollments.pagination,
    selectStatus: (state) => state.enrollments.listStatus,
    selectError: (state) => state.enrollments.listError,
    errorMessage: 'Không thể tải danh sách ghi danh.',
  });

  const [classOptions, setClassOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailEnrollment, setDetailEnrollment] = useState(null);
  const [createForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchClasses({ pageSize: 100 })).then((action) => {
      if (fetchClasses.fulfilled.match(action)) {
        setClassOptions((action.payload.items || []).map((c) => ({ value: c.id, label: c.class_name })));
      }
    });
    dispatch(fetchUsers({ role: ROLES.STUDENT, pageSize: 100 })).then((action) => {
      if (fetchUsers.fulfilled.match(action)) {
        setStudentOptions((action.payload.items || []).map((u) => ({ value: u.id, label: u.full_name })));
      }
    });
  }, [dispatch]);

  const handleCreate = async () => {
    let values;
    try {
      values = await createForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const action = await dispatch(createEnrollment(values));
    setSubmitting(false);
    if (createEnrollment.fulfilled.match(action)) {
      toast.success('Xếp học viên vào lớp thành công.');
      setCreateModal(false);
      refresh();
    } else {
      toast.error(action.payload || 'Không thể xếp lớp.');
    }
  };

  const handleStatusChange = async (record, status) => {
    setBusyId(record.id);
    const action = await dispatch(updateEnrollmentStatus({ id: record.id, status }));
    setBusyId(null);
    if (!updateEnrollmentStatus.fulfilled.match(action)) {
      toast.error(action.payload || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (record) => {
    setBusyId(record.id);
    const action = await dispatch(deleteEnrollment(record.id));
    setBusyId(null);
    if (deleteEnrollment.fulfilled.match(action)) {
      toast.success('Đã xóa ghi danh.');
    } else {
      toast.error(action.payload || 'Không thể xóa ghi danh.');
    }
  };

  const columns = [
    { title: 'Học viên', key: 'student', render: (_, r) => r.users?.full_name },
    { title: 'Lớp', key: 'class', render: (_, r) => r.classes?.class_name },
    { title: 'Khóa học', key: 'course', render: (_, r) => r.classes?.courses?.title },
    { title: 'Học phí', key: 'tuition', render: (_, r) => formatCurrency(r.classes?.courses?.tuition_fee) },
    { title: 'Miễn giảm', dataIndex: 'discount_amount', render: formatCurrency },
    {
      title: 'Đã đóng',
      key: 'paid',
      render: (_, r) => formatCurrency((r.payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0)),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, r) => (
        <Select
          value={r.status}
          style={{ width: 130 }}
          loading={busyId === r.id}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
            value,
            label: (
              <Tag color={STATUS_COLORS[value]} style={{ marginInlineEnd: 0 }}>
                {label}
              </Tag>
            ),
          }))}
          onChange={(v) => handleStatusChange(r, v)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => setDetailEnrollment(r)}>
            Chi tiết
          </Button>
          <Popconfirm title="Xóa ghi danh?" description="Đây là xóa mềm, lịch sử tài chính vẫn được giữ lại." okText="Xóa" okType="danger" cancelText="Hủy" onConfirm={() => handleDelete(r)}>
            <Button size="small" danger loading={busyId === r.id}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <Button type="primary" onClick={() => setCreateModal(true)}>
          + Ghi danh thủ công
        </Button>
      </div>

      <Space className="mb-3" wrap>
        <Select placeholder="Lớp học" allowClear style={{ width: 200 }} options={classOptions} onChange={(class_id) => setFilters({ ...filters, class_id })} />
        <Select placeholder="Học viên" allowClear style={{ width: 200 }} options={studentOptions} onChange={(student_id) => setFilters({ ...filters, student_id })} />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 160 }}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(status) => setFilters({ ...filters, status })}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal title="Ghi danh thủ công" open={createModal} onOk={handleCreate} onCancel={() => setCreateModal(false)} confirmLoading={submitting} okText="Xếp lớp" cancelText="Hủy" destroyOnHidden>
        <Form form={createForm} layout="vertical">
          <Form.Item name="student_id" label="Học viên" rules={[{ required: true, message: 'Vui lòng chọn học viên' }]}>
            <Select options={studentOptions} placeholder="Chọn học viên" showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="class_id" label="Lớp học" rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}>
            <Select options={classOptions} placeholder="Chọn lớp học" showSearch optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Modal>

      <EnrollmentDetailDrawer enrollment={detailEnrollment} onClose={() => setDetailEnrollment(null)} onChanged={refresh} />
    </div>
  );
};

// ---------- Trang chính ----------
const AdminEnrollmentsPage = () => {
  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Ghi Danh &amp; Học Phí</h3>
      <Tabs
        items={[
          { key: 'list', label: 'Ghi danh', children: <EnrollmentListTab /> },
          { key: 'debt', label: 'Báo cáo công nợ', children: <DebtReportTab /> },
        ]}
      />
    </div>
  );
};

export default AdminEnrollmentsPage;

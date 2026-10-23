import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Select } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatDate } from '@/common/utils/format.js';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import { fetchEnrollments } from '@/redux/slices/enrollmentsSlice.jsx';
import { fetchCertificates, issueCertificate } from '@/redux/slices/certificatesSlice.jsx';

const AdminCertificatesPage = () => {
  const dispatch = useDispatch();
  const { items, loading, tableProps, refresh } = useServerTable({
    thunk: fetchCertificates,
    selectItems: (state) => state.certificates.items,
    selectPagination: (state) => state.certificates.pagination,
    selectStatus: (state) => state.certificates.listStatus,
    selectError: (state) => state.certificates.listError,
    errorMessage: 'Không thể tải danh sách chứng chỉ.',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eligibleOptions, setEligibleOptions] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [form] = Form.useForm();

  const openIssueModal = async () => {
    setModalOpen(true);
    setLoadingEligible(true);
    const action = await dispatch(fetchEnrollments({ status: 'completed', pageSize: 200 }));
    setLoadingEligible(false);
    if (fetchEnrollments.fulfilled.match(action)) {
      const issuedEnrollmentIds = new Set(items.map((c) => c.enrollment_id));
      const options = (action.payload.items || [])
        .filter((e) => !issuedEnrollmentIds.has(e.id))
        .map((e) => ({
          value: e.id,
          label: `${e.users?.full_name || '—'} — ${e.classes?.class_name || '—'} (${e.classes?.courses?.title || '—'})`,
        }));
      setEligibleOptions(options);
    }
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(issueCertificate(values.enrollment_id));
    setSubmitting(false);
    if (issueCertificate.fulfilled.match(resultAction)) {
      toast.success('Cấp chứng chỉ thành công.');
      setModalOpen(false);
      form.resetFields();
      refresh();
    } else {
      toast.error(resultAction.payload || 'Không thể cấp chứng chỉ.');
    }
  };

  const handleDownload = (record) => {
    window.open(`${import.meta.env.VITE_API_URL}${ENDPOINTS.CERTIFICATES}/${record.id}/download`, '_blank');
  };

  const handleCopyVerifyLink = async (record) => {
    const url = `${window.location.origin}/verify-certificate/${record.certificate_code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết xác minh.');
    } catch {
      toast.error('Không thể sao chép. Mã chứng chỉ: ' + record.certificate_code);
    }
  };

  const columns = [
    { title: 'Mã chứng chỉ', dataIndex: 'certificate_code', width: 160 },
    { title: 'Học viên', key: 'student', render: (_, r) => r.enrollments?.users?.full_name || '—' },
    { title: 'Khóa học', key: 'course', render: (_, r) => r.enrollments?.classes?.courses?.title || '—' },
    { title: 'Ngày cấp', dataIndex: 'issued_at', width: 120, render: formatDate },
    {
      title: '',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => handleDownload(record)}>
            Tải PDF
          </Button>
          <Button size="small" onClick={() => handleCopyVerifyLink(record)}>
            Sao chép link xác minh
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Quản Lý Chứng Chỉ</h3>
        <Button type="primary" onClick={openIssueModal}>
          + Cấp chứng chỉ
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title="Cấp chứng chỉ"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText="Cấp chứng chỉ"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="enrollment_id"
            label="Học viên đã hoàn thành khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn học viên' }]}
            help={eligibleOptions.length === 0 && !loadingEligible ? 'Không có học viên nào đủ điều kiện (đã hoàn thành và chưa cấp chứng chỉ).' : undefined}
          >
            <Select
              options={eligibleOptions}
              loading={loadingEligible}
              placeholder="Chọn học viên / lớp học"
              showSearch
              optionFilterProp="label"
              notFoundContent={loadingEligible ? 'Đang tải...' : 'Không có dữ liệu'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCertificatesPage;

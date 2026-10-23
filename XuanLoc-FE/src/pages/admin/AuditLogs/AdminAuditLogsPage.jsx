import { Table, Select, Space, InputNumber, Tag } from 'antd';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { fetchAuditLogs } from '@/redux/slices/auditLogsSlice.jsx';

const ACTION_OPTIONS = [
  { value: 'user.toggle_status', label: 'Người dùng: đổi trạng thái' },
  { value: 'user.reset_password', label: 'Người dùng: đặt lại mật khẩu' },
  { value: 'user.delete', label: 'Người dùng: xóa' },
  { value: 'enrollment.update_status', label: 'Ghi danh: đổi trạng thái' },
  { value: 'enrollment.delete', label: 'Ghi danh: xóa' },
  { value: 'enrollment.set_discount', label: 'Ghi danh: miễn giảm học phí' },
  { value: 'enrollment.apply_voucher', label: 'Ghi danh: áp voucher' },
  { value: 'payment.create', label: 'Thanh toán: lập phiếu thu' },
  { value: 'refund.create', label: 'Thanh toán: lập phiếu hoàn tiền' },
  { value: 'grade.create', label: 'Điểm: thêm điểm' },
];

const ENTITY_OPTIONS = [
  { value: 'users', label: 'Người dùng' },
  { value: 'enrollments', label: 'Ghi danh' },
  { value: 'payments', label: 'Thanh toán' },
  { value: 'refunds', label: 'Hoàn tiền' },
  { value: 'grades', label: 'Điểm' },
];

const ROLE_COLORS = { admin: 'gold', teacher: 'blue', student: 'green' };

const AdminAuditLogsPage = () => {
  const { items, loading, filters, setFilters, tableProps } = useServerTable({
    thunk: fetchAuditLogs,
    selectItems: (state) => state.auditLogs.items,
    selectPagination: (state) => state.auditLogs.pagination,
    selectStatus: (state) => state.auditLogs.listStatus,
    selectError: (state) => state.auditLogs.listError,
    errorMessage: 'Không thể tải nhật ký hoạt động.',
  });

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      width: 170,
      render: (v) => (v ? new Date(v).toLocaleString('vi-VN') : '—'),
    },
    {
      title: 'Người thực hiện',
      key: 'user',
      width: 160,
      render: (_, r) => (
        <Space orientation="vertical" size={0}>
          <span>{r.user_id ? `#${r.user_id}` : 'Hệ thống'}</span>
          {r.user_role && <Tag color={ROLE_COLORS[r.user_role]}>{r.user_role}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      width: 220,
      render: (action) => <Tag color="processing">{action}</Tag>,
    },
    {
      title: 'Đối tượng',
      key: 'entity',
      width: 160,
      render: (_, r) => (r.entity_type ? `${r.entity_type}${r.entity_id ? ` #${r.entity_id}` : ''}` : '—'),
    },
    {
      title: 'Chi tiết',
      dataIndex: 'meta',
      render: (meta) =>
        meta ? (
          <code className="small text-muted" style={{ wordBreak: 'break-all' }}>
            {JSON.stringify(meta)}
          </code>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Nhật Ký Hoạt Động</h3>
      </div>

      <Space className="mb-3" wrap>
        <Select
          placeholder="Lọc theo hành động"
          allowClear
          style={{ width: 240 }}
          options={ACTION_OPTIONS}
          onChange={(action) => setFilters({ ...filters, action })}
        />
        <Select
          placeholder="Lọc theo đối tượng"
          allowClear
          style={{ width: 180 }}
          options={ENTITY_OPTIONS}
          onChange={(entity_type) => setFilters({ ...filters, entity_type })}
        />
        <InputNumber
          placeholder="Mã người dùng"
          min={1}
          style={{ width: 150 }}
          onChange={(user_id) => setFilters({ ...filters, user_id: user_id || undefined })}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />
    </div>
  );
};

export default AdminAuditLogsPage;

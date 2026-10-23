import { useState } from 'react';
import { Table, Button, Input, Select, Tag, Space, Modal, Form, InputNumber, Popconfirm, Switch, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { getInitials } from '@/common/utils/getInitials.js';
import { ROLES } from '@/common/constants/roles.js';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import {
  fetchUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  setTeacherRate,
  deleteUser,
} from '@/redux/slices/usersSlice.jsx';

const { Search } = Input;

const ROLE_LABELS = { [ROLES.ADMIN]: 'Admin', [ROLES.TEACHER]: 'Giáo viên', [ROLES.STUDENT]: 'Học viên' };
const ROLE_COLORS = { [ROLES.ADMIN]: 'gold', [ROLES.TEACHER]: 'blue', [ROLES.STUDENT]: 'green' };

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { items, loading, filters, setFilters, tableProps, refresh } = useServerTable({
    thunk: fetchUsers,
    selectItems: (state) => state.users.items,
    selectPagination: (state) => state.users.pagination,
    selectStatus: (state) => state.users.listStatus,
    selectError: (state) => state.users.listError,
    errorMessage: 'Không thể tải danh sách người dùng.',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [rateModalUser, setRateModalUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [rateForm] = Form.useForm();

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = editingUser
      ? await dispatch(updateUser({ id: editingUser.id, payload: values }))
      : await dispatch(createUser(values));
    setSubmitting(false);

    const matchFulfilled = editingUser ? updateUser.fulfilled.match : createUser.fulfilled.match;
    if (matchFulfilled(resultAction)) {
      toast.success(editingUser ? 'Cập nhật người dùng thành công.' : 'Tạo người dùng thành công.');
      setModalOpen(false);
      refresh();
    } else {
      toast.error(resultAction.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleToggleStatus = async (user) => {
    setBusyId(user.id);
    const resultAction = await dispatch(
      toggleUserStatus({ id: user.id, status: user.status === 'active' ? 'inactive' : 'active' }),
    );
    setBusyId(null);
    if (!toggleUserStatus.fulfilled.match(resultAction)) {
      toast.error(resultAction.payload || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (user) => {
    setBusyId(user.id);
    const resultAction = await dispatch(deleteUser(user.id));
    setBusyId(null);
    if (deleteUser.fulfilled.match(resultAction)) {
      toast.success('Đã xóa người dùng.');
    } else {
      toast.error(resultAction.payload || 'Không thể xóa người dùng.');
    }
  };

  const handleResetPassword = async () => {
    let values;
    try {
      values = await passwordForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(
      resetUserPassword({ id: passwordModalUser.id, newPassword: values.newPassword }),
    );
    setSubmitting(false);
    if (resetUserPassword.fulfilled.match(resultAction)) {
      toast.success('Đặt lại mật khẩu thành công.');
      setPasswordModalUser(null);
    } else {
      toast.error(resultAction.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleSetRate = async () => {
    let values;
    try {
      values = await rateForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(
      setTeacherRate({ id: rateModalUser.id, rate_per_session: values.rate_per_session }),
    );
    setSubmitting(false);
    if (setTeacherRate.fulfilled.match(resultAction)) {
      toast.success('Cập nhật đơn giá/buổi thành công.');
      setRateModalUser(null);
    } else {
      toast.error(resultAction.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.keyword) params.set('keyword', filters.keyword);
    window.open(`${import.meta.env.VITE_API_URL}${ENDPOINTS.USERS}/export?${params.toString()}`, '_blank');
  };

  const columns = [
    {
      title: '',
      key: 'avatar',
      width: 56,
      render: (_, record) => (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: '#1677ff', fontSize: 13 }}
        >
          {getInitials(record.full_name, '?')}
        </div>
      ),
    },
    { title: 'Họ tên', dataIndex: 'full_name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone', render: (v) => v || '—' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 120,
      render: (role) => <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role] || role}</Tag>,
    },
    {
      title: 'Mã HV / Chuyên môn',
      key: 'detail',
      render: (_, record) =>
        record.role === ROLES.STUDENT
          ? record.student_details?.student_code || '—'
          : record.role === ROLES.TEACHER
            ? record.teacher_details?.specialization || '—'
            : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          loading={busyId === record.id}
          disabled={record.id === currentUser?.id}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Ngừng"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button size="small" onClick={() => setPasswordModalUser(record)}>
            Reset MK
          </Button>
          {record.role === ROLES.TEACHER && (
            <Button size="small" onClick={() => setRateModalUser(record)}>
              Đơn giá/buổi
            </Button>
          )}
          <Tooltip title={record.id === currentUser?.id ? 'Không thể tự xóa tài khoản của chính mình' : ''}>
            <Popconfirm
              title="Xóa người dùng?"
              description="Toàn bộ dữ liệu liên quan (ghi danh, điểm danh...) sẽ bị ảnh hưởng. Hành động này không thể hoàn tác."
              okText="Xóa"
              okType="danger"
              cancelText="Hủy"
              disabled={record.id === currentUser?.id}
              onConfirm={() => handleDelete(record)}
            >
              <Button size="small" danger loading={busyId === record.id} disabled={record.id === currentUser?.id}>
                Xóa
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Quản Lý Người Dùng</h3>
        <Space>
          <Button onClick={handleExport}>Xuất Excel</Button>
          <Button type="primary" onClick={openCreateModal}>
            + Thêm người dùng
          </Button>
        </Space>
      </div>

      <Space className="mb-3" wrap>
        <Search
          placeholder="Tìm theo tên, email, SĐT..."
          allowClear
          onSearch={(keyword) => setFilters({ ...filters, keyword })}
          style={{ width: 260 }}
        />
        <Select
          placeholder="Vai trò"
          allowClear
          style={{ width: 160 }}
          options={[
            { value: ROLES.ADMIN, label: 'Admin' },
            { value: ROLES.TEACHER, label: 'Giáo viên' },
            { value: ROLES.STUDENT, label: 'Học viên' },
          ]}
          onChange={(role) => setFilters({ ...filters, role })}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingUser ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select
              options={[
                { value: ROLES.ADMIN, label: 'Admin' },
                { value: ROLES.TEACHER, label: 'Giáo viên' },
                { value: ROLES.STUDENT, label: 'Học viên' },
              ]}
            />
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'inactive', label: 'Ngừng hoạt động' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`Đặt lại mật khẩu — ${passwordModalUser?.full_name || ''}`}
        open={!!passwordModalUser}
        onOk={handleResetPassword}
        onCancel={() => setPasswordModalUser(null)}
        confirmLoading={submitting}
        okText="Đặt lại"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Đơn giá/buổi — ${rateModalUser?.full_name || ''}`}
        open={!!rateModalUser}
        onOk={handleSetRate}
        onCancel={() => setRateModalUser(null)}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={rateForm} layout="vertical" initialValues={{ rate_per_session: rateModalUser?.teacher_details?.rate_per_session }}>
          <Form.Item
            name="rate_per_session"
            label="Đơn giá mỗi buổi dạy (đ)"
            rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
          >
            <InputNumber min={0} step={50000} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;

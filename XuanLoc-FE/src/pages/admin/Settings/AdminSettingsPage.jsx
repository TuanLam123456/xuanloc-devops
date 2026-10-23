import { useState } from 'react';
import { Table, Button, Input, Select, Tag, Modal, Form, InputNumber, Switch, Tabs, DatePicker } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatCurrency, formatDate } from '@/common/utils/format.js';
import {
  fetchRooms,
  createRoom,
  updateRoom,
  toggleRoomStatus,
  fetchVouchers,
  createVoucher,
  toggleVoucherStatus,
} from '@/redux/slices/settingsSlice.jsx';

const RoomsTab = () => {
  const dispatch = useDispatch();
  const { items, loading, tableProps, refresh } = useServerTable({
    thunk: fetchRooms,
    selectItems: (state) => state.settings.rooms,
    selectPagination: () => undefined,
    selectStatus: (state) => state.settings.roomsStatus,
    selectError: (state) => state.settings.roomsError,
    errorMessage: 'Không thể tải danh sách phòng học.',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form] = Form.useForm();

  const openCreateModal = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
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
    const resultAction = editingRoom
      ? await dispatch(updateRoom({ id: editingRoom.id, payload: values }))
      : await dispatch(createRoom(values));
    setSubmitting(false);

    const matchFulfilled = editingRoom ? updateRoom.fulfilled.match : createRoom.fulfilled.match;
    if (matchFulfilled(resultAction)) {
      toast.success(editingRoom ? 'Cập nhật phòng học thành công.' : 'Tạo phòng học thành công.');
      setModalOpen(false);
      refresh();
    } else {
      toast.error(resultAction.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleToggleStatus = async (room) => {
    setBusyId(room.id);
    const resultAction = await dispatch(toggleRoomStatus({ id: room.id, is_active: !room.is_active }));
    setBusyId(null);
    if (!toggleRoomStatus.fulfilled.match(resultAction)) {
      toast.error(resultAction.payload || 'Không thể cập nhật trạng thái.');
    }
  };

  const columns = [
    { title: 'Tên phòng', dataIndex: 'name' },
    { title: 'Sức chứa', dataIndex: 'capacity', width: 110, render: (v) => v ?? '—' },
    { title: 'Ghi chú', dataIndex: 'note', render: (v) => v || '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 140,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          loading={busyId === record.id}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Đã ẩn"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Button size="small" onClick={() => openEditModal(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <Button type="primary" onClick={openCreateModal}>
          + Thêm phòng học
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title={editingRoom ? 'Sửa phòng học' : 'Thêm phòng học'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingRoom ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên phòng học" rules={[{ required: true, message: 'Vui lòng nhập tên phòng học' }]}>
            <Input placeholder="VD: Phòng 6" />
          </Form.Item>
          <Form.Item name="capacity" label="Sức chứa">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const VouchersTab = () => {
  const dispatch = useDispatch();
  const { items, loading, tableProps, refresh } = useServerTable({
    thunk: fetchVouchers,
    selectItems: (state) => state.settings.vouchers,
    selectPagination: (state) => state.settings.vouchersPagination,
    selectStatus: (state) => state.settings.vouchersStatus,
    selectError: (state) => state.settings.vouchersError,
    errorMessage: 'Không thể tải danh sách voucher.',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form] = Form.useForm();
  const discountType = Form.useWatch('discount_type', form);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const [validFrom, validTo] = values.valid_range || [];
    const payload = {
      code: values.code,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      max_uses: values.max_uses ?? null,
      valid_from: validFrom ? validFrom.format('YYYY-MM-DD') : null,
      valid_to: validTo ? validTo.format('YYYY-MM-DD') : null,
    };
    setSubmitting(true);
    const resultAction = await dispatch(createVoucher(payload));
    setSubmitting(false);
    if (createVoucher.fulfilled.match(resultAction)) {
      toast.success('Tạo voucher thành công.');
      setModalOpen(false);
      refresh();
    } else {
      toast.error(resultAction.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleToggleStatus = async (voucher) => {
    setBusyId(voucher.id);
    const resultAction = await dispatch(toggleVoucherStatus({ id: voucher.id, is_active: !voucher.is_active }));
    setBusyId(null);
    if (!toggleVoucherStatus.fulfilled.match(resultAction)) {
      toast.error(resultAction.payload || 'Không thể cập nhật trạng thái.');
    }
  };

  const columns = [
    { title: 'Mã voucher', dataIndex: 'code' },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      width: 140,
      render: (type) => (
        <Tag color={type === 'percent' ? 'purple' : 'blue'}>{type === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}</Tag>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'discount_value',
      width: 130,
      render: (value, record) => (record.discount_type === 'percent' ? `${Number(value)}%` : formatCurrency(value)),
    },
    {
      title: 'Lượt dùng',
      key: 'usage',
      width: 110,
      render: (_, record) => `${record.used_count} / ${record.max_uses ?? '∞'}`,
    },
    {
      title: 'Hiệu lực',
      key: 'valid',
      width: 200,
      render: (_, record) => `${formatDate(record.valid_from)} - ${formatDate(record.valid_to)}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 140,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          loading={busyId === record.id}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Đã ẩn"
        />
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <Button type="primary" onClick={() => setModalOpen(true)}>
          + Thêm voucher
        </Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title="Thêm voucher"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText="Tạo"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ discount_type: 'fixed' }}>
          <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}>
            <Input placeholder="VD: KHAIGIANG2026" />
          </Form.Item>
          <Form.Item name="discount_type" label="Loại giảm giá" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'fixed', label: 'Số tiền cố định' },
                { value: 'percent', label: 'Phần trăm' },
              ]}
            />
          </Form.Item>
          <Form.Item name="discount_value" label="Giá trị giảm" rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}>
            <InputNumber
              min={0}
              max={discountType === 'percent' ? 100 : undefined}
              style={{ width: '100%' }}
              suffix={discountType === 'percent' ? '%' : 'đ'}
            />
          </Form.Item>
          <Form.Item name="max_uses" label="Số lượt dùng tối đa (bỏ trống = không giới hạn)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="valid_range" label="Thời gian hiệu lực">
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const AdminSettingsPage = () => {
  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Danh Mục</h3>
      <Tabs
        items={[
          { key: 'rooms', label: 'Phòng học', children: <RoomsTab /> },
          { key: 'vouchers', label: 'Voucher', children: <VouchersTab /> },
        ]}
      />
    </div>
  );
};

export default AdminSettingsPage;

import { useState } from 'react';
import { Table, Button, Input, Select, Space, Modal, Form, InputNumber, Popconfirm, Switch } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatCurrency } from '@/common/utils/format.js';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  toggleCourseStatus,
  deleteCourse,
} from '@/redux/slices/coursesSlice.jsx';

const { Search } = Input;

const AdminCoursesPage = () => {
  const dispatch = useDispatch();
  const { items, loading, filters, setFilters, tableProps, refresh } = useServerTable({
    thunk: fetchCourses,
    selectItems: (state) => state.courses.items,
    selectPagination: (state) => state.courses.pagination,
    selectStatus: (state) => state.courses.listStatus,
    selectError: (state) => state.courses.listError,
    errorMessage: 'Không thể tải danh sách khóa học.',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form] = Form.useForm();

  const openCreateModal = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // antd đã tự hiện lỗi validate trên từng field
    }
    setSubmitting(true);
    const resultAction = editingCourse
      ? await dispatch(updateCourse({ id: editingCourse.id, payload: values }))
      : await dispatch(createCourse(values));
    setSubmitting(false);

    const matchFulfilled = editingCourse ? updateCourse.fulfilled.match : createCourse.fulfilled.match;
    if (matchFulfilled(resultAction)) {
      toast.success(editingCourse ? 'Cập nhật khóa học thành công.' : 'Tạo khóa học thành công.');
      setModalOpen(false);
      refresh();
    } else {
      toast.error(resultAction.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleToggleStatus = async (course) => {
    setBusyId(course.id);
    const resultAction = await dispatch(toggleCourseStatus({ id: course.id, is_active: !course.is_active }));
    setBusyId(null);
    if (!toggleCourseStatus.fulfilled.match(resultAction)) {
      toast.error(resultAction.payload || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (course) => {
    setBusyId(course.id);
    const resultAction = await dispatch(deleteCourse(course.id));
    setBusyId(null);
    if (deleteCourse.fulfilled.match(resultAction)) {
      toast.success('Đã xóa khóa học.');
    } else {
      toast.error(resultAction.payload || 'Không thể xóa khóa học.');
    }
  };

  const columns = [
    { title: 'Mã', dataIndex: 'code', width: 110 },
    { title: 'Tên khóa học', dataIndex: 'title' },
    { title: 'Học phí', dataIndex: 'tuition_fee', width: 140, render: formatCurrency },
    { title: 'Thời lượng', dataIndex: 'duration_months', width: 110, render: (v) => `${v} tháng` },
    { title: 'Số lớp', dataIndex: ['_count', 'classes'], width: 90, align: 'center' },
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa khóa học?"
            description={
              record._count?.classes > 0
                ? `Khóa học này đang có ${record._count.classes} lớp học liên quan — xóa sẽ ảnh hưởng toàn bộ dữ liệu của các lớp đó.`
                : 'Hành động này không thể hoàn tác.'
            }
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger loading={busyId === record.id}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Quản Lý Khóa Học</h3>
        <Button type="primary" onClick={openCreateModal}>
          + Thêm khóa học
        </Button>
      </div>

      <Space className="mb-3" wrap>
        <Search
          placeholder="Tìm theo mã hoặc tên..."
          allowClear
          onSearch={(keyword) => setFilters({ ...filters, keyword })}
          style={{ width: 260 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 160 }}
          options={[
            { value: 'true', label: 'Hoạt động' },
            { value: 'false', label: 'Đã ẩn' },
          ]}
          onChange={(is_active) => setFilters({ ...filters, is_active })}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title={editingCourse ? 'Sửa khóa học' : 'Thêm khóa học'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingCourse ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã khóa học" rules={[{ required: true, message: 'Vui lòng nhập mã khóa học' }]}>
            <Input placeholder="VD: IELTS-INTENSIVE" />
          </Form.Item>
          <Form.Item name="title" label="Tên khóa học" rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="tuition_fee"
            label="Học phí (đ)"
            rules={[{ required: true, message: 'Vui lòng nhập học phí' }]}
          >
            <InputNumber min={0} step={100000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="duration_months"
            label="Thời lượng (tháng)"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCoursesPage;

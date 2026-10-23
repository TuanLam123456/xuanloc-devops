import { useEffect, useState } from 'react';
import { Table, Button, Select, Tag, Space, Modal, Form, Input, DatePicker, Popconfirm, Drawer, Empty, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatDate } from '@/common/utils/format.js';
import { ROLES } from '@/common/constants/roles.js';
import { fetchCourses } from '@/redux/slices/coursesSlice.jsx';
import { fetchUsers } from '@/redux/slices/usersSlice.jsx';
import {
  fetchRegistrations,
  updateRegistrationStatus,
  assignRegistration,
  setFollowUpDate,
  deleteRegistration,
  fetchRegistrationNotes,
  addRegistrationNote,
} from '@/redux/slices/registrationsSlice.jsx';

const SOURCE_LABELS = { facebook: 'Facebook', zalo: 'Zalo', walkin: 'Tại trung tâm', referral: 'Giới thiệu', other: 'Khác' };
const SOURCE_COLORS = { facebook: 'blue', zalo: 'cyan', walkin: 'green', referral: 'purple', other: 'default' };
const STATUS_LABELS = { pending: 'Chờ xử lý', approved: 'Đã duyệt', rejected: 'Đã từ chối' };
const STATUS_COLORS = { pending: 'gold', approved: 'green', rejected: 'red' };

const AdminRegistrationsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, filters, setFilters, tableProps } = useServerTable({
    thunk: fetchRegistrations,
    selectItems: (state) => state.registrations.items,
    selectPagination: (state) => state.registrations.pagination,
    selectStatus: (state) => state.registrations.listStatus,
    selectError: (state) => state.registrations.listError,
    errorMessage: 'Không thể tải danh sách đăng ký tư vấn.',
  });

  const [courseOptions, setCourseOptions] = useState([]);
  const [adminOptions, setAdminOptions] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [rejectModalReg, setRejectModalReg] = useState(null);
  const [assignModalReg, setAssignModalReg] = useState(null);
  const [followUpModalReg, setFollowUpModalReg] = useState(null);
  const [notesDrawerReg, setNotesDrawerReg] = useState(null);
  const [notesList, setNotesList] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  const [rejectForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [followUpForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCourses({ pageSize: 100 })).then((action) => {
      if (fetchCourses.fulfilled.match(action)) {
        setCourseOptions((action.payload.items || []).map((c) => ({ value: c.id, label: c.title })));
      }
    });
    dispatch(fetchUsers({ role: ROLES.ADMIN, pageSize: 100 })).then((action) => {
      if (fetchUsers.fulfilled.match(action)) {
        setAdminOptions((action.payload.items || []).map((u) => ({ value: u.id, label: u.full_name })));
      }
    });
  }, [dispatch]);

  const handleApprove = async (reg) => {
    setBusyId(reg.id);
    const resultAction = await dispatch(updateRegistrationStatus({ id: reg.id, status: 'approved' }));
    setBusyId(null);
    if (updateRegistrationStatus.fulfilled.match(resultAction)) {
      toast.success('Đã duyệt đơn đăng ký.');
    } else {
      toast.error(resultAction.payload || 'Không thể duyệt đơn.');
    }
  };

  const handleReject = async () => {
    let values;
    try {
      values = await rejectForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(
      updateRegistrationStatus({ id: rejectModalReg.id, status: 'rejected', reject_reason: values.reject_reason }),
    );
    setSubmitting(false);
    if (updateRegistrationStatus.fulfilled.match(resultAction)) {
      toast.success('Đã từ chối đơn đăng ký.');
      setRejectModalReg(null);
    } else {
      toast.error(resultAction.payload || 'Không thể từ chối đơn.');
    }
  };

  const handleAssign = async () => {
    let values;
    try {
      values = await assignForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(assignRegistration({ id: assignModalReg.id, assigned_to: values.assigned_to }));
    setSubmitting(false);
    if (assignRegistration.fulfilled.match(resultAction)) {
      toast.success('Đã gán người phụ trách.');
      setAssignModalReg(null);
    } else {
      toast.error(resultAction.payload || 'Không thể gán người phụ trách.');
    }
  };

  const handleSetFollowUp = async () => {
    let values;
    try {
      values = await followUpForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(
      setFollowUpDate({ id: followUpModalReg.id, follow_up_date: values.follow_up_date.format('YYYY-MM-DD') }),
    );
    setSubmitting(false);
    if (setFollowUpDate.fulfilled.match(resultAction)) {
      toast.success('Đã đặt lịch theo dõi.');
      setFollowUpModalReg(null);
    } else {
      toast.error(resultAction.payload || 'Không thể đặt lịch theo dõi.');
    }
  };

  const handleDelete = async (reg) => {
    setBusyId(reg.id);
    const resultAction = await dispatch(deleteRegistration(reg.id));
    setBusyId(null);
    if (deleteRegistration.fulfilled.match(resultAction)) {
      toast.success('Đã xóa đơn đăng ký.');
    } else {
      toast.error(resultAction.payload || 'Không thể xóa đơn đăng ký.');
    }
  };

  const openNotesDrawer = async (reg) => {
    setNotesDrawerReg(reg);
    setNotesLoading(true);
    const resultAction = await dispatch(fetchRegistrationNotes(reg.id));
    setNotesLoading(false);
    if (fetchRegistrationNotes.fulfilled.match(resultAction)) {
      setNotesList(resultAction.payload || []);
    } else {
      toast.error(resultAction.payload || 'Không thể tải ghi chú.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSubmitting(true);
    const resultAction = await dispatch(addRegistrationNote({ id: notesDrawerReg.id, note: newNote.trim() }));
    setSubmitting(false);
    if (addRegistrationNote.fulfilled.match(resultAction)) {
      setNewNote('');
      // POST không trả kèm users (chỉ GET /notes mới include) nên gọi lại để hiện đúng tên người ghi chú
      const notesAction = await dispatch(fetchRegistrationNotes(notesDrawerReg.id));
      if (fetchRegistrationNotes.fulfilled.match(notesAction)) {
        setNotesList(notesAction.payload || []);
      }
    } else {
      toast.error(resultAction.payload || 'Không thể thêm ghi chú.');
    }
  };

  const columns = [
    { title: 'Họ tên', dataIndex: 'full_name' },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.phone}</div>
          <div className="text-muted small">{record.email}</div>
        </div>
      ),
    },
    { title: 'Khóa học quan tâm', key: 'course', render: (_, record) => record.courses?.title || '—' },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      width: 110,
      render: (source) => <Tag color={SOURCE_COLORS[source]}>{SOURCE_LABELS[source] || source}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status) => <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status] || status}</Tag>,
    },
    { title: 'Phụ trách', key: 'assignee', render: (_, record) => record.users?.full_name || 'Chưa gán' },
    { title: 'Ngày hẹn', dataIndex: 'follow_up_date', width: 110, render: formatDate },
    {
      title: 'Ghi chú',
      key: 'notes',
      width: 90,
      render: (_, record) => (
        <Button size="small" onClick={() => openNotesDrawer(record)}>
          {record._count?.registration_notes || 0}
        </Button>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => handleApprove(record)} loading={busyId === record.id}>
            Duyệt
          </Button>
          <Button size="small" onClick={() => setRejectModalReg(record)}>
            Từ chối
          </Button>
          <Button size="small" onClick={() => setAssignModalReg(record)}>
            Gán
          </Button>
          <Button size="small" onClick={() => setFollowUpModalReg(record)}>
            Hẹn
          </Button>
          <Popconfirm
            title="Xóa đơn đăng ký?"
            description="Hành động này không thể hoàn tác."
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
      <h3 className="fw-bold text-dark mb-3">Tư Vấn / CRM</h3>

      <Space className="mb-3" wrap>
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          options={[
            { value: 'pending', label: 'Chờ xử lý' },
            { value: 'approved', label: 'Đã duyệt' },
            { value: 'rejected', label: 'Đã từ chối' },
          ]}
          onChange={(status) => setFilters({ ...filters, status })}
        />
        <Select
          placeholder="Khóa học"
          allowClear
          style={{ width: 200 }}
          options={courseOptions}
          onChange={(course_id) => setFilters({ ...filters, course_id })}
        />
        <Select
          placeholder="Nguồn"
          allowClear
          style={{ width: 150 }}
          options={Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(source) => setFilters({ ...filters, source })}
        />
        <Select
          placeholder="Người phụ trách"
          allowClear
          style={{ width: 180 }}
          options={adminOptions}
          onChange={(assigned_to) => setFilters({ ...filters, assigned_to })}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title="Từ chối đơn đăng ký"
        open={!!rejectModalReg}
        onOk={handleReject}
        onCancel={() => setRejectModalReg(null)}
        confirmLoading={submitting}
        okText="Từ chối"
        okType="danger"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item name="reject_reason" label="Lý do từ chối (không bắt buộc)">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Gán người phụ trách"
        open={!!assignModalReg}
        onOk={handleAssign}
        onCancel={() => setAssignModalReg(null)}
        confirmLoading={submitting}
        okText="Gán"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item name="assigned_to" label="Nhân viên phụ trách" rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}>
            <Select options={adminOptions} placeholder="Chọn admin" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đặt lịch theo dõi"
        open={!!followUpModalReg}
        onOk={handleSetFollowUp}
        onCancel={() => setFollowUpModalReg(null)}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={followUpForm} layout="vertical">
          <Form.Item name="follow_up_date" label="Ngày hẹn tiếp theo" rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`Ghi chú — ${notesDrawerReg?.full_name || ''}`}
        open={!!notesDrawerReg}
        onClose={() => setNotesDrawerReg(null)}
        size={400}
      >
        <div className="mb-3 d-flex gap-2">
          <Input.TextArea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Ghi chú chăm sóc mới..."
          />
          <Button type="primary" onClick={handleAddNote} loading={submitting}>
            Gửi
          </Button>
        </div>

        {notesLoading && (
          <div className="text-center py-4">
            <Spin />
          </div>
        )}

        {!notesLoading && notesList.length === 0 && <Empty description="Chưa có ghi chú nào" />}

        {!notesLoading && notesList.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {notesList.map((n) => (
              <div key={n.id} className="pb-2 border-bottom">
                <div className="d-flex justify-content-between">
                  <span className="fw-semibold small">{n.users?.full_name || 'Hệ thống'}</span>
                  <span className="text-muted small">{formatDate(n.created_at)}</span>
                </div>
                <p className="mb-0 small">{n.note}</p>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminRegistrationsPage;

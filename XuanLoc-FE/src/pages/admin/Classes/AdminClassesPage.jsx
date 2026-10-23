import { useEffect, useState } from 'react';
import { Table, Button, Select, Tag, Space, Modal, Form, Input, InputNumber, DatePicker, TimePicker, Popconfirm, Drawer, Tabs, Empty, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatDate } from '@/common/utils/format.js';
import { ROLES } from '@/common/constants/roles.js';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import axiosClient from '@/api/axiosClient.jsx';
import { fetchCourses } from '@/redux/slices/coursesSlice.jsx';
import { fetchUsers } from '@/redux/slices/usersSlice.jsx';
import { fetchRooms } from '@/redux/slices/settingsSlice.jsx';
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchAttendanceRoster,
  saveBatchAttendance,
  fetchWaitlist,
  promoteFromWaitlist,
  removeFromWaitlist,
} from '@/redux/slices/classesSlice.jsx';

const STATUS_LABELS = { upcoming: 'Sắp khai giảng', ongoing: 'Đang học', completed: 'Đã kết thúc', cancelled: 'Đã hủy' };
const STATUS_COLORS = { upcoming: 'blue', ongoing: 'green', completed: 'default', cancelled: 'red' };
const ATTENDANCE_LABELS = { present: 'Có mặt', absent: 'Vắng', late: 'Trễ' };

// BE lưu/trả @db.Time dưới dạng Date với giờ/phút LITERAL nằm ở getter UTC (không phụ thuộc
// timezone server) - phải đọc/ghi qua UTC, không parse bằng dayjs local, nếu không giờ hiển thị
// sẽ bị lệch theo timezone trình duyệt (VD: 18:00 lưu UTC-literal sẽ hiện thành 01:00 nếu parse local ở UTC+7).
const formatTimeUTC = (isoString) => {
  const d = new Date(isoString);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
const timeStringToLocalDayjs = (isoString) => {
  const d = new Date(isoString);
  return dayjs().hour(d.getUTCHours()).minute(d.getUTCMinutes()).second(0).millisecond(0);
};

// ---------- Tab: Lịch học ----------
const ScheduleTab = ({ classId }) => {
  const dispatch = useDispatch();
  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setStatus('loading');
    const action = await dispatch(fetchSchedules(classId));
    if (fetchSchedules.fulfilled.match(action)) {
      setSchedules(action.payload);
      setStatus('succeeded');
    } else {
      setStatus('failed');
      toast.error(action.payload || 'Không thể tải lịch học.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      session_date: dayjs(item.session_date),
      time_range: [timeStringToLocalDayjs(item.start_time), timeStringToLocalDayjs(item.end_time)],
      room: item.room,
      note: item.note,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload = {
      class_id: classId,
      session_date: values.session_date.format('YYYY-MM-DD'),
      start_time: values.time_range[0].format('HH:mm'),
      end_time: values.time_range[1].format('HH:mm'),
      room: values.room,
      note: values.note,
    };
    setSubmitting(true);
    const action = editingItem
      ? await dispatch(updateSchedule({ id: editingItem.id, payload }))
      : await dispatch(createSchedule(payload));
    setSubmitting(false);
    const matchFulfilled = editingItem ? updateSchedule.fulfilled.match : createSchedule.fulfilled.match;
    if (matchFulfilled(action)) {
      toast.success(editingItem ? 'Cập nhật buổi học thành công.' : 'Tạo buổi học thành công.');
      setModalOpen(false);
      load();
    } else {
      toast.error(action.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDelete = async (item) => {
    setBusyId(item.id);
    const action = await dispatch(deleteSchedule(item.id));
    setBusyId(null);
    if (deleteSchedule.fulfilled.match(action)) {
      toast.success('Đã xóa buổi học.');
      setSchedules((prev) => prev.filter((s) => s.id !== item.id));
    } else {
      toast.error(action.payload || 'Không thể xóa buổi học.');
    }
  };

  const columns = [
    { title: 'Ngày học', dataIndex: 'session_date', render: formatDate, width: 110 },
    {
      title: 'Giờ học',
      key: 'time',
      render: (_, r) => `${formatTimeUTC(r.start_time)} - ${formatTimeUTC(r.end_time)}`,
    },
    { title: 'Phòng', dataIndex: 'room' },
    { title: 'Ghi chú', dataIndex: 'note', render: (v) => v || '—' },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa buổi học?" okText="Xóa" okType="danger" cancelText="Hủy" onConfirm={() => handleDelete(r)}>
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
        <Button type="primary" onClick={openCreate}>
          + Thêm buổi học
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={schedules} loading={status === 'loading'} pagination={false} />
      <Modal
        title={editingItem ? 'Sửa buổi học' : 'Thêm buổi học'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingItem ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnHidden
      >
        {editingItem && (
          <p className="text-muted small">Lưu ý: đổi giờ/ngày/phòng sẽ gửi email báo thay đổi cho học viên đang active trong lớp.</p>
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="session_date" label="Ngày học" rules={[{ required: true, message: 'Vui lòng chọn ngày học' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="time_range" label="Giờ học" rules={[{ required: true, message: 'Vui lòng chọn giờ học' }]}>
            <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item name="room" label="Phòng học" rules={[{ required: true, message: 'Vui lòng nhập phòng học' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ---------- Tab: Điểm danh ----------
const AttendanceTab = ({ classId }) => {
  const dispatch = useDispatch();
  const [date, setDate] = useState(dayjs());
  const [roster, setRoster] = useState([]);
  const [status, setStatus] = useState('idle');
  const [saving, setSaving] = useState(false);

  const load = async (d) => {
    setStatus('loading');
    const action = await dispatch(fetchAttendanceRoster({ classId, date: d.format('YYYY-MM-DD') }));
    if (fetchAttendanceRoster.fulfilled.match(action)) {
      setRoster(action.payload);
      setStatus('succeeded');
    } else {
      setStatus('failed');
      toast.error(action.payload || 'Không thể tải danh sách điểm danh.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => load(date), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleDateChange = (d) => {
    if (!d) return;
    setDate(d);
    load(d);
  };

  const updateRow = (studentId, field, value) => {
    setRoster((prev) => prev.map((r) => (r.student_id === studentId ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    const action = await dispatch(
      saveBatchAttendance({
        class_id: classId,
        attendance_date: date.format('YYYY-MM-DD'),
        attendance_list: roster.map((r) => ({ student_id: r.student_id, status: r.status, note: r.note })),
      }),
    );
    setSaving(false);
    if (saveBatchAttendance.fulfilled.match(action)) {
      toast.success('Đã lưu điểm danh.');
    } else {
      toast.error(action.payload || 'Không thể lưu điểm danh.');
    }
  };

  const columns = [
    { title: 'Học viên', dataIndex: 'full_name' },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, r) => (
        <Select
          value={r.status}
          style={{ width: 130 }}
          options={Object.entries(ATTENDANCE_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(v) => updateRow(r.student_id, 'status', v)}
        />
      ),
    },
    {
      title: 'Ghi chú',
      key: 'note',
      render: (_, r) => (
        <Input value={r.note || ''} onChange={(e) => updateRow(r.student_id, 'note', e.target.value)} placeholder="Ghi chú..." />
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <DatePicker value={date} onChange={handleDateChange} format="DD/MM/YYYY" allowClear={false} />
        <Button type="primary" onClick={handleSave} loading={saving} disabled={roster.length === 0}>
          Lưu điểm danh
        </Button>
      </div>
      {status === 'loading' ? (
        <div className="text-center py-4">
          <Spin />
        </div>
      ) : roster.length === 0 ? (
        <Empty description="Lớp chưa có học viên đang active" />
      ) : (
        <Table rowKey="student_id" columns={columns} dataSource={roster} pagination={false} />
      )}
    </div>
  );
};

// ---------- Tab: Danh sách chờ ----------
const WaitlistTab = ({ classId }) => {
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('idle');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setStatus('loading');
    const action = await dispatch(fetchWaitlist(classId));
    if (fetchWaitlist.fulfilled.match(action)) {
      setList(action.payload);
      setStatus('succeeded');
    } else {
      setStatus('failed');
      toast.error(action.payload || 'Không thể tải danh sách chờ.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handlePromote = async (item) => {
    setBusyId(item.id);
    const action = await dispatch(promoteFromWaitlist(item.id));
    setBusyId(null);
    if (promoteFromWaitlist.fulfilled.match(action)) {
      toast.success('Đã chuyển thành ghi danh chính thức.');
      setList((prev) => prev.filter((w) => w.id !== item.id));
    } else {
      toast.error(action.payload || 'Không thể thăng cấp học viên này.');
    }
  };

  const handleRemove = async (item) => {
    setBusyId(item.id);
    const action = await dispatch(removeFromWaitlist(item.id));
    setBusyId(null);
    if (removeFromWaitlist.fulfilled.match(action)) {
      toast.success('Đã xóa khỏi danh sách chờ.');
      setList((prev) => prev.filter((w) => w.id !== item.id));
    } else {
      toast.error(action.payload || 'Không thể xóa.');
    }
  };

  const columns = [
    { title: 'Học viên', key: 'name', render: (_, r) => r.users?.full_name },
    { title: 'Email', key: 'email', render: (_, r) => r.users?.email },
    { title: 'SĐT', key: 'phone', render: (_, r) => r.users?.phone },
    { title: 'Ngày đăng ký chờ', dataIndex: 'created_at', render: formatDate, width: 140 },
    {
      title: '',
      key: 'actions',
      width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" onClick={() => handlePromote(r)} loading={busyId === r.id}>
            Thăng cấp
          </Button>
          <Popconfirm title="Xóa khỏi danh sách chờ?" okText="Xóa" okType="danger" cancelText="Hủy" onConfirm={() => handleRemove(r)}>
            <Button size="small" danger loading={busyId === r.id}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return status === 'loading' ? (
    <div className="text-center py-4">
      <Spin />
    </div>
  ) : list.length === 0 ? (
    <Empty description="Chưa có học viên nào trong danh sách chờ" />
  ) : (
    <Table rowKey="id" columns={columns} dataSource={list} pagination={false} />
  );
};

// ---------- Tab: Học viên (chỉ xem) ----------
const RosterTab = ({ classId }) => {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('loading');
      axiosClient
        .get(ENDPOINTS.ENROLLMENTS, { params: { class_id: classId, pageSize: 100 } })
        .then((res) => {
          setList((res.data || res)?.items || []);
          setStatus('succeeded');
        })
        .catch(() => setStatus('failed'));
    }, 0);
    return () => clearTimeout(timer);
  }, [classId]);

  const columns = [
    { title: 'Học viên', key: 'name', render: (_, r) => r.users?.full_name },
    { title: 'Email', key: 'email', render: (_, r) => r.users?.email },
    { title: 'SĐT', key: 'phone', render: (_, r) => r.users?.phone },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s) => <Tag color={s === 'active' ? 'green' : s === 'completed' ? 'blue' : 'default'}>{s}</Tag>,
    },
  ];

  return status === 'loading' ? (
    <div className="text-center py-4">
      <Spin />
    </div>
  ) : list.length === 0 ? (
    <Empty description="Lớp chưa có học viên nào" />
  ) : (
    <Table rowKey="id" columns={columns} dataSource={list} pagination={false} />
  );
};

// ---------- Drawer chi tiết lớp học ----------
const ClassDetailDrawer = ({ classRecord, onClose }) => (
  <Drawer title={`Chi tiết — ${classRecord?.class_name || ''}`} open={!!classRecord} onClose={onClose} size={720}>
    {classRecord && (
      <Tabs
        items={[
          { key: 'schedule', label: 'Lịch học', children: <ScheduleTab classId={classRecord.id} /> },
          { key: 'attendance', label: 'Điểm danh', children: <AttendanceTab classId={classRecord.id} /> },
          { key: 'waitlist', label: 'Danh sách chờ', children: <WaitlistTab classId={classRecord.id} /> },
          { key: 'roster', label: 'Học viên', children: <RosterTab classId={classRecord.id} /> },
        ]}
      />
    )}
  </Drawer>
);

// ---------- Trang chính ----------
const AdminClassesPage = () => {
  const dispatch = useDispatch();
  const { items, loading, filters, setFilters, tableProps, refresh } = useServerTable({
    thunk: fetchClasses,
    selectItems: (state) => state.classes.items,
    selectPagination: (state) => state.classes.pagination,
    selectStatus: (state) => state.classes.listStatus,
    selectError: (state) => state.classes.listError,
    errorMessage: 'Không thể tải danh sách lớp học.',
  });

  const [courseOptions, setCourseOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [detailClass, setDetailClass] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCourses({ pageSize: 100 })).then((action) => {
      if (fetchCourses.fulfilled.match(action)) {
        setCourseOptions((action.payload.items || []).map((c) => ({ value: c.id, label: c.title })));
      }
    });
    dispatch(fetchUsers({ role: ROLES.TEACHER, pageSize: 100 })).then((action) => {
      if (fetchUsers.fulfilled.match(action)) {
        setTeacherOptions((action.payload.items || []).map((u) => ({ value: u.id, label: u.full_name })));
      }
    });
    dispatch(fetchRooms()).then((action) => {
      if (fetchRooms.fulfilled.match(action)) {
        setRoomOptions((action.payload || []).filter((r) => r.is_active).map((r) => ({ value: r.name, label: r.name })));
      }
    });
  }, [dispatch]);

  const openCreate = () => {
    setEditingClass(null);
    setModalOpen(true);
  };
  const openEdit = (record) => {
    setEditingClass(record);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload = { ...values, start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null };
    setSubmitting(true);
    const action = editingClass
      ? await dispatch(updateClass({ id: editingClass.id, payload }))
      : await dispatch(createClass(payload));
    setSubmitting(false);
    const matchFulfilled = editingClass ? updateClass.fulfilled.match : createClass.fulfilled.match;
    if (matchFulfilled(action)) {
      toast.success(editingClass ? 'Cập nhật lớp học thành công.' : 'Tạo lớp học thành công.');
      setModalOpen(false);
      refresh();
    } else {
      toast.error(action.payload || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDelete = async (record) => {
    setBusyId(record.id);
    const action = await dispatch(deleteClass(record.id));
    setBusyId(null);
    if (deleteClass.fulfilled.match(action)) {
      toast.success('Đã xóa lớp học.');
    } else {
      toast.error(action.payload || 'Không thể xóa lớp học.');
    }
  };

  const columns = [
    { title: 'Tên lớp', dataIndex: 'class_name' },
    { title: 'Khóa học', key: 'course', render: (_, r) => r.courses?.title || '—' },
    { title: 'Giáo viên', key: 'teacher', render: (_, r) => r.users?.full_name || 'Chưa phân công' },
    { title: 'Phòng', dataIndex: 'room' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (s) => <Tag color={STATUS_COLORS[s]}>{STATUS_LABELS[s] || s}</Tag>,
    },
    { title: 'Khai giảng', dataIndex: 'start_date', render: formatDate, width: 110 },
    {
      title: 'Sĩ số',
      key: 'count',
      width: 90,
      render: (_, r) => `${r._count?.enrollments || 0}/${r.max_students ?? '∞'}`,
    },
    {
      title: '',
      key: 'actions',
      width: 220,
      render: (_, r) => (
        <Space wrap>
          <Button size="small" onClick={() => setDetailClass(r)}>
            Chi tiết
          </Button>
          <Button size="small" onClick={() => openEdit(r)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa lớp học?" description="Toàn bộ dữ liệu ghi danh, điểm danh... liên quan sẽ bị ảnh hưởng." okText="Xóa" okType="danger" cancelText="Hủy" onConfirm={() => handleDelete(r)}>
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
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Quản Lý Lớp Học</h3>
        <Button type="primary" onClick={openCreate}>
          + Thêm lớp học
        </Button>
      </div>

      <Space className="mb-3" wrap>
        <Select placeholder="Khóa học" allowClear style={{ width: 200 }} options={courseOptions} onChange={(course_id) => setFilters({ ...filters, course_id })} />
        <Select placeholder="Giáo viên" allowClear style={{ width: 180 }} options={teacherOptions} onChange={(teacher_id) => setFilters({ ...filters, teacher_id })} />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 160 }}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(status) => setFilters({ ...filters, status })}
        />
        <Input.Search placeholder="Tìm theo tên lớp..." allowClear style={{ width: 220 }} onSearch={(keyword) => setFilters({ ...filters, keyword })} />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />

      <Modal
        title={editingClass ? 'Sửa lớp học' : 'Thêm lớp học'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingClass ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="course_id" label="Khóa học" rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}>
            <Select options={courseOptions} placeholder="Chọn khóa học" />
          </Form.Item>
          <Form.Item name="teacher_id" label="Giáo viên phụ trách">
            <Select options={teacherOptions} placeholder="Chưa phân công" allowClear />
          </Form.Item>
          <Form.Item name="class_name" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}>
            <Input placeholder="VD: IELTS-2610" />
          </Form.Item>
          <Form.Item name="room" label="Phòng học">
            <Select options={roomOptions} placeholder="Phòng 1" allowClear />
          </Form.Item>
          <Form.Item name="schedule_text" label="Lịch học (hiển thị)">
            <Input placeholder="VD: Tối 2-4-6 (18:00-19:30)" />
          </Form.Item>
          <Form.Item name="start_date" label="Ngày khai giảng">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))} placeholder="upcoming" />
          </Form.Item>
          <Form.Item name="max_students" label="Sĩ số tối đa">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <ClassDetailDrawer classRecord={detailClass} onClose={() => setDetailClass(null)} />
    </div>
  );
};

export default AdminClassesPage;

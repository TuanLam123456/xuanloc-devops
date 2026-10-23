import { useEffect, useMemo, useState } from 'react';
import { Table, Select, DatePicker, Button, Input, Empty, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { fetchMyTaughtClasses, fetchAttendanceRoster, saveBatchAttendance } from '@/redux/slices/classesSlice.jsx';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Có mặt' },
  { value: 'absent', label: 'Vắng' },
  { value: 'late', label: 'Đi trễ' },
];

const TeacherAttendancePage = () => {
  const dispatch = useDispatch();
  const { myTaughtItems: classes } = useSelector((state) => state.classes);
  const { attendanceRoster: roster, attendanceStatus } = useSelector((state) => state.classes);
  const loading = attendanceStatus === 'loading';

  const [classId, setClassId] = useState(null);
  const [date, setDate] = useState(() => dayjs());
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  // "Điều chỉnh state khi prop đổi" ngay trong lúc render (theo khuyến nghị của React) thay vì
  // qua useEffect, để tránh render thừa 1 nhịp mỗi khi roster được fetch lại.
  const [prevRoster, setPrevRoster] = useState(roster);
  if (roster !== prevRoster) {
    setPrevRoster(roster);
    const initial = {};
    roster.forEach((r) => {
      initial[r.student_id] = { status: r.status, note: r.note || '' };
    });
    setEdits(initial);
  }

  useEffect(() => {
    dispatch(fetchMyTaughtClasses());
  }, [dispatch]);

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: c.class_name })), [classes]);

  const loadRoster = (cId, d) => {
    if (!cId || !d) return;
    dispatch(fetchAttendanceRoster({ classId: cId, date: d.format('YYYY-MM-DD') }));
  };

  useEffect(() => {
    if (classId) loadRoster(classId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date]);


  const handleSave = async () => {
    const attendance_list = roster.map((r) => ({
      student_id: r.student_id,
      status: edits[r.student_id]?.status || 'present',
      note: edits[r.student_id]?.note || undefined,
    }));
    setSaving(true);
    const resultAction = await dispatch(
      saveBatchAttendance({ class_id: classId, attendance_date: date.format('YYYY-MM-DD'), attendance_list }),
    );
    setSaving(false);
    if (saveBatchAttendance.fulfilled.match(resultAction)) {
      toast.success('Lưu điểm danh thành công.');
      loadRoster(classId, date);
    } else {
      toast.error(resultAction.payload || 'Không thể lưu điểm danh.');
    }
  };

  const columns = [
    { title: 'Học viên', dataIndex: 'full_name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_, r) => (
        <Select
          value={edits[r.student_id]?.status || 'present'}
          options={STATUS_OPTIONS}
          style={{ width: 140 }}
          onChange={(status) => setEdits({ ...edits, [r.student_id]: { ...edits[r.student_id], status } })}
        />
      ),
    },
    {
      title: 'Ghi chú',
      key: 'note',
      render: (_, r) => (
        <Input
          value={edits[r.student_id]?.note || ''}
          placeholder="Ghi chú (tùy chọn)"
          onChange={(e) => setEdits({ ...edits, [r.student_id]: { ...edits[r.student_id], note: e.target.value } })}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Điểm Danh</h3>
        <Button type="primary" disabled={!classId || roster.length === 0} loading={saving} onClick={handleSave}>
          Lưu điểm danh
        </Button>
      </div>

      <Space className="mb-3" wrap>
        <Select
          placeholder="Chọn lớp học"
          style={{ width: 220 }}
          options={classOptions}
          value={classId}
          onChange={setClassId}
        />
        <DatePicker value={date} onChange={(v) => setDate(v || dayjs())} format="DD/MM/YYYY" allowClear={false} />
      </Space>

      {!classId ? (
        <Empty description="Vui lòng chọn lớp học để điểm danh" />
      ) : (
        <Table
          rowKey="student_id"
          columns={columns}
          dataSource={roster}
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'Lớp học chưa có học viên đang theo học' }}
        />
      )}
    </div>
  );
};

export default TeacherAttendancePage;

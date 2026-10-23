import { useEffect } from 'react';
import { Table, Tag, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDate, formatTime } from '@/common/utils/format.js';
import { fetchTeacherSchedule } from '@/redux/slices/scheduleSlice.jsx';

const TeacherSchedulePage = () => {
  const dispatch = useDispatch();
  const { teacherItems: items, teacherStatus } = useSelector((state) => state.schedule);
  const loading = teacherStatus === 'loading';

  useEffect(() => {
    dispatch(fetchTeacherSchedule());
  }, [dispatch]);

  useEffect(() => {
    if (teacherStatus === 'failed') toast.error('Không thể tải lịch giảng dạy.');
  }, [teacherStatus]);

  const isPast = (record) => new Date(record.session_date) < new Date(new Date().toDateString());

  const columns = [
    { title: 'Ngày', dataIndex: 'session_date', width: 120, render: formatDate },
    {
      title: 'Giờ dạy',
      key: 'time',
      width: 130,
      render: (_, r) => `${formatTime(r.start_time)} - ${formatTime(r.end_time)}`,
    },
    { title: 'Lớp học', key: 'class', render: (_, r) => r.classes?.class_name },
    { title: 'Khóa học', key: 'course', render: (_, r) => r.classes?.courses?.title },
    { title: 'Phòng', key: 'room', render: (_, r) => r.room || r.classes?.room },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_, r) => (isPast(r) ? <Tag>Đã qua</Tag> : <Tag color="blue">Sắp tới</Tag>),
    },
  ];

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Lịch Giảng Dạy</h3>
      {!loading && items.length === 0 ? (
        <Empty description="Bạn chưa có buổi dạy nào trong lịch" />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} />
      )}
    </div>
  );
};

export default TeacherSchedulePage;

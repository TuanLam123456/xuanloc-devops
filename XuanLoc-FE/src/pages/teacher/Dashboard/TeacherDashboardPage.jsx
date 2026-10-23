import { useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Empty, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '@/common/utils/format.js';
import { fetchMyTaughtClasses } from '@/redux/slices/classesSlice.jsx';
import { fetchTeacherSchedule } from '@/redux/slices/scheduleSlice.jsx';

const TeacherDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { myTaughtItems: classes, myTaughtStatus } = useSelector((state) => state.classes);
  const { teacherItems: schedule, teacherStatus } = useSelector((state) => state.schedule);

  useEffect(() => {
    dispatch(fetchMyTaughtClasses());
    dispatch(fetchTeacherSchedule());
  }, [dispatch]);

  const loading = myTaughtStatus === 'loading' || teacherStatus === 'loading';

  const ongoingClasses = useMemo(
    () => classes.filter((c) => c.status === 'ongoing' || c.status === 'upcoming'),
    [classes],
  );

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return [...schedule]
      .filter((s) => new Date(s.session_date) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
      .slice(0, 5);
  }, [schedule]);

  const columns = [
    { title: 'Ngày', dataIndex: 'session_date', width: 110, render: formatDate },
    {
      title: 'Giờ học',
      key: 'time',
      width: 130,
      render: (_, r) => `${formatTime(r.start_time)} - ${formatTime(r.end_time)}`,
    },
    { title: 'Lớp học', key: 'class', render: (_, r) => r.classes?.class_name },
    { title: 'Phòng', key: 'room', render: (_, r) => r.room || r.classes?.room },
  ];

  return (
    <div>
      <h2 className="fw-bold text-dark mb-1">Chào mừng, {user?.full_name}!</h2>
      <p className="text-muted mb-4">Khu vực giảng dạy của bạn tại Trung tâm Ngoại ngữ Xuân Lộc.</p>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic title="Lớp đang/sắp giảng dạy" value={ongoingClasses.length} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic title="Tổng số lớp phụ trách" value={classes.length} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic title="Buổi dạy sắp tới" value={upcomingSessions.length} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Card
        className="shadow-sm"
        title="Lịch dạy sắp tới"
        extra={<Link to="/teacher/schedule">Xem toàn bộ lịch dạy</Link>}
      >
        {loading ? (
          <div className="text-center py-4">
            <Spin />
          </div>
        ) : upcomingSessions.length === 0 ? (
          <Empty description="Không có buổi dạy nào sắp tới" />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={upcomingSessions} pagination={false} size="small" />
        )}
      </Card>
    </div>
  );
};

export default TeacherDashboardPage;

import { useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Table, Empty, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, formatTime } from '@/common/utils/format.js';
import { fetchMyEnrollments } from '@/redux/slices/enrollmentsSlice.jsx';
import { fetchStudentSchedule } from '@/redux/slices/scheduleSlice.jsx';

const StudentDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { myItems: enrollments, myStatus } = useSelector((state) => state.enrollments);
  const { studentItems: schedule, studentStatus } = useSelector((state) => state.schedule);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
    dispatch(fetchStudentSchedule());
  }, [dispatch]);

  const loading = myStatus === 'loading' || studentStatus === 'loading';

  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.status === 'active'),
    [enrollments],
  );

  const totalBalanceDue = useMemo(() => {
    return enrollments.reduce((sum, e) => {
      const tuition = Number(e.classes?.courses?.tuition_fee || 0);
      const discount = Number(e.discount_amount || 0);
      const paid = (e.payments || []).reduce((s, p) => s + Number(p.amount_paid), 0);
      const refunded = (e.refunds || []).reduce((s, r) => s + Number(r.amount), 0);
      return sum + (tuition - discount - (paid - refunded));
    }, 0);
  }, [enrollments]);

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
      <p className="text-muted mb-4">Khu vực học tập của bạn tại Trung tâm Ngoại ngữ Xuân Lộc.</p>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic title="Lớp đang học" value={activeEnrollments.length} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng học phí còn phải đóng"
              value={formatCurrency(totalBalanceDue)}
              loading={loading}
              styles={{ content: { color: totalBalanceDue > 0 ? '#cf1322' : '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic title="Buổi học sắp tới" value={upcomingSessions.length} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Card
        className="shadow-sm"
        title="Lịch học sắp tới"
        extra={<Link to="/student/schedule">Xem toàn bộ lịch học</Link>}
      >
        {loading ? (
          <div className="text-center py-4">
            <Spin />
          </div>
        ) : upcomingSessions.length === 0 ? (
          <Empty description="Không có buổi học nào sắp tới" />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={upcomingSessions} pagination={false} size="small" />
        )}
      </Card>
    </div>
  );
};

export default StudentDashboardPage;

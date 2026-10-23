import { useEffect } from 'react';
import { Card, Row, Col, Tag, Empty, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDate } from '@/common/utils/format.js';
import { fetchMyTaughtClasses } from '@/redux/slices/classesSlice.jsx';

const STATUS_LABELS = { upcoming: 'Sắp khai giảng', ongoing: 'Đang diễn ra', completed: 'Đã kết thúc', cancelled: 'Đã hủy' };
const STATUS_COLORS = { upcoming: 'blue', ongoing: 'green', completed: 'default', cancelled: 'red' };

const TeacherClassesPage = () => {
  const dispatch = useDispatch();
  const { myTaughtItems: items, myTaughtStatus } = useSelector((state) => state.classes);
  const loading = myTaughtStatus === 'loading';

  useEffect(() => {
    dispatch(fetchMyTaughtClasses());
  }, [dispatch]);

  useEffect(() => {
    if (myTaughtStatus === 'failed') toast.error('Không thể tải danh sách lớp học.');
  }, [myTaughtStatus]);

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Lớp Tôi Dạy</h3>

      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Empty description="Bạn chưa được phân công lớp học nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((c) => (
            <Col xs={24} md={12} lg={8} key={c.id}>
              <Card
                className="h-100 shadow-sm"
                title={c.class_name}
                extra={<Tag color={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status] || c.status}</Tag>}
              >
                <p className="text-muted mb-2">{c.courses?.title}</p>
                <div className="small mb-1">
                  <i className="bi bi-calendar-week me-1" aria-hidden="true"></i>
                  {c.schedule_text || 'Đang cập nhật lịch học'}
                </div>
                <div className="small mb-1">
                  <i className="bi bi-door-open me-1" aria-hidden="true"></i>
                  {c.room || 'Đang cập nhật phòng học'}
                </div>
                <div className="small mb-1">
                  <i className="bi bi-calendar-event me-1" aria-hidden="true"></i>
                  Khai giảng: {formatDate(c.start_date)}
                </div>
                <div className="small">
                  <i className="bi bi-people me-1" aria-hidden="true"></i>
                  Sĩ số: {c._count?.enrollments ?? 0}
                  {c.max_students ? ` / ${c.max_students}` : ''}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default TeacherClassesPage;

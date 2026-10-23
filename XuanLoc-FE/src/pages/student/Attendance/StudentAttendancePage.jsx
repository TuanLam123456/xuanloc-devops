import { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Select, Space, Statistic, Card, Row, Col, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDate } from '@/common/utils/format.js';
import { fetchMyAttendance } from '@/redux/slices/attendanceSlice.jsx';

const STATUS_LABELS = { present: 'Có mặt', absent: 'Vắng', late: 'Đi trễ' };
const STATUS_COLORS = { present: 'green', absent: 'red', late: 'gold' };

const StudentAttendancePage = () => {
  const dispatch = useDispatch();
  const { myItems: items, myStatus } = useSelector((state) => state.attendance);
  const loading = myStatus === 'loading';
  const [classFilter, setClassFilter] = useState(null);

  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, [dispatch]);

  useEffect(() => {
    if (myStatus === 'failed') toast.error('Không thể tải lịch sử điểm danh.');
  }, [myStatus]);

  const classOptions = useMemo(() => {
    const map = new Map();
    items.forEach((i) => {
      if (i.classes && !map.has(i.class_id)) map.set(i.class_id, i.classes.class_name);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [items]);

  const filteredItems = classFilter ? items.filter((i) => i.class_id === classFilter) : items;

  const presentRate = filteredItems.length
    ? (filteredItems.filter((i) => i.status === 'present').length / filteredItems.length) * 100
    : 0;
  const absentCount = filteredItems.filter((i) => i.status === 'absent').length;

  const columns = [
    { title: 'Ngày', dataIndex: 'attendance_date', width: 120, render: formatDate },
    { title: 'Lớp học', key: 'class', render: (_, r) => r.classes?.class_name },
    { title: 'Khóa học', key: 'course', render: (_, r) => r.classes?.courses?.title },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status) => <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status] || status}</Tag>,
    },
    { title: 'Ghi chú', dataIndex: 'note', render: (v) => v || '—' },
  ];

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Điểm Danh Của Tôi</h3>

      <Row gutter={16} className="mb-3">
        <Col xs={12} md={6}>
          <Card className="shadow-sm">
            <Statistic title="Tỷ lệ có mặt" value={presentRate} precision={1} suffix="%" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="shadow-sm">
            <Statistic title="Số buổi vắng" value={absentCount} valueStyle={{ color: absentCount > 0 ? '#cf1322' : undefined }} />
          </Card>
        </Col>
      </Row>

      <Space className="mb-3">
        <Select
          placeholder="Lọc theo lớp học"
          allowClear
          style={{ width: 220 }}
          options={classOptions}
          onChange={(v) => setClassFilter(v ?? null)}
        />
      </Space>

      {!loading && items.length === 0 ? (
        <Empty description="Chưa có dữ liệu điểm danh" />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={filteredItems} loading={loading} pagination={false} />
      )}
    </div>
  );
};

export default StudentAttendancePage;

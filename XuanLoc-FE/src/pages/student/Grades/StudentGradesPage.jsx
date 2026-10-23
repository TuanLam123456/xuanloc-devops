import { useEffect } from 'react';
import { Table, Tag, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDate } from '@/common/utils/format.js';
import { fetchMyGrades } from '@/redux/slices/gradesSlice.jsx';

const scoreColor = (score) => {
  const n = Number(score);
  if (n >= 8) return 'green';
  if (n >= 5) return 'gold';
  return 'red';
};

const StudentGradesPage = () => {
  const dispatch = useDispatch();
  const { myItems: items, myStatus } = useSelector((state) => state.grades);
  const loading = myStatus === 'loading';

  useEffect(() => {
    dispatch(fetchMyGrades());
  }, [dispatch]);

  useEffect(() => {
    if (myStatus === 'failed') toast.error('Không thể tải bảng điểm.');
  }, [myStatus]);

  const columns = [
    { title: 'Lớp học', key: 'class', render: (_, r) => r.enrollments?.classes?.class_name || '—' },
    { title: 'Tên bài kiểm tra', dataIndex: 'title' },
    {
      title: 'Điểm',
      dataIndex: 'score',
      width: 100,
      render: (score) => <Tag color={scoreColor(score)}>{Number(score)}/10</Tag>,
    },
    { title: 'Nhận xét của giáo viên', dataIndex: 'teacher_comment', render: (v) => v || '—' },
    { title: 'Ngày', dataIndex: 'created_at', width: 120, render: formatDate },
  ];

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Bảng Điểm Của Tôi</h3>
      {!loading && items.length === 0 ? (
        <Empty description="Bạn chưa có điểm số nào" />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} />
      )}
    </div>
  );
};

export default StudentGradesPage;

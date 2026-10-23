import { useEffect, useState } from 'react';
import { Table, Button, Select, Space, Popconfirm, Rate } from 'antd';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useServerTable } from '@/common/hooks/useServerTable.js';
import { formatDate } from '@/common/utils/format.js';
import { fetchClasses } from '@/redux/slices/classesSlice.jsx';
import { fetchReviews, deleteReview } from '@/redux/slices/reviewsSlice.jsx';

const AdminReviewsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, filters, setFilters, tableProps } = useServerTable({
    thunk: fetchReviews,
    selectItems: (state) => state.reviews.items,
    selectPagination: (state) => state.reviews.pagination,
    selectStatus: (state) => state.reviews.listStatus,
    selectError: (state) => state.reviews.listError,
    errorMessage: 'Không thể tải danh sách đánh giá.',
  });

  const [classOptions, setClassOptions] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchClasses({ pageSize: 100 })).then((action) => {
      if (fetchClasses.fulfilled.match(action)) {
        setClassOptions((action.payload.items || []).map((c) => ({ value: c.id, label: c.class_name })));
      }
    });
  }, [dispatch]);

  const handleDelete = async (review) => {
    setBusyId(review.id);
    const resultAction = await dispatch(deleteReview(review.id));
    setBusyId(null);
    if (deleteReview.fulfilled.match(resultAction)) {
      toast.success('Đã xóa đánh giá.');
    } else {
      toast.error(resultAction.payload || 'Không thể xóa đánh giá.');
    }
  };

  const columns = [
    { title: 'Học viên', key: 'student', render: (_, r) => r.users?.full_name || '—' },
    { title: 'Lớp học', key: 'class', render: (_, r) => r.classes?.class_name || '—' },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      width: 180,
      render: (rating) => <Rate disabled value={rating} style={{ fontSize: 14 }} />,
    },
    { title: 'Nhận xét', dataIndex: 'comment', render: (v) => v || '—' },
    { title: 'Ngày gửi', dataIndex: 'created_at', width: 120, render: formatDate },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Xóa đánh giá?"
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
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Quản Lý Đánh Giá</h3>
      </div>

      <Space className="mb-3" wrap>
        <Select
          placeholder="Lọc theo lớp học"
          allowClear
          style={{ width: 220 }}
          options={classOptions}
          showSearch
          optionFilterProp="label"
          onChange={(class_id) => setFilters({ ...filters, class_id })}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={items} loading={loading} {...tableProps} />
    </div>
  );
};

export default AdminReviewsPage;

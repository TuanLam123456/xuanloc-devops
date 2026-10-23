import { useEffect, useState } from 'react';
import { Table, Button, DatePicker, Space, Statistic, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { formatCurrency } from '@/common/utils/format.js';
import { ENDPOINTS } from '@/api/endpoints.jsx';
import { fetchPayroll } from '@/redux/slices/payrollSlice.jsx';

const AdminPayrollPage = () => {
  const dispatch = useDispatch();
  const [month, setMonth] = useState(() => dayjs());
  const { rows, totalPay, listStatus, listError } = useSelector((state) => state.payroll);
  const loading = listStatus === 'loading';

  useEffect(() => {
    dispatch(fetchPayroll({ month: month.month() + 1, year: month.year() }));
  }, [dispatch, month]);

  useEffect(() => {
    if (listStatus === 'failed') toast.error(listError || 'Không thể tải bảng lương.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStatus]);

  const handleExport = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}${ENDPOINTS.PAYROLL}/export?month=${month.month() + 1}&year=${month.year()}`,
      '_blank',
    );
  };

  const columns = [
    { title: 'Mã GV', dataIndex: 'teacher_id', width: 90 },
    { title: 'Giáo viên', dataIndex: 'teacher_name' },
    { title: 'Số buổi dạy', dataIndex: 'sessions_completed', width: 130, align: 'center' },
    { title: 'Đơn giá/buổi', dataIndex: 'rate_per_session', width: 150, render: formatCurrency },
    {
      title: 'Tổng lương',
      dataIndex: 'total_pay',
      width: 160,
      render: (v) => <span className="fw-bold text-primary">{formatCurrency(v)}</span>,
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Bảng Lương Giáo Viên</h3>
        <Space>
          <DatePicker
            picker="month"
            value={month}
            onChange={(value) => setMonth(value || dayjs())}
            format="MM/YYYY"
            allowClear={false}
          />
          <Button onClick={handleExport}>Xuất Excel</Button>
        </Space>
      </div>

      <Card className="mb-3 border-0 shadow-sm" style={{ maxWidth: 300 }}>
        <Statistic
          title={`Tổng chi lương tháng ${month.month() + 1}/${month.year()}`}
          value={totalPay}
          formatter={(v) => formatCurrency(v)}
        />
      </Card>

      <Table rowKey="teacher_id" columns={columns} dataSource={rows} loading={loading} pagination={false} />
    </div>
  );
};

export default AdminPayrollPage;

import { useEffect, useState } from 'react';
import { Card, DatePicker, Statistic, Row, Col, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { formatCurrency } from '@/common/utils/format.js';
import { fetchTeacherPayroll } from '@/redux/slices/payrollSlice.jsx';

const TeacherPayrollPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { myPayroll, myStatus } = useSelector((state) => state.payroll);
  const loading = myStatus === 'loading';
  const [month, setMonth] = useState(() => dayjs());

  useEffect(() => {
    if (!currentUser?.id) return;
    dispatch(fetchTeacherPayroll({ teacherId: currentUser.id, month: month.month() + 1, year: month.year() }));
  }, [dispatch, currentUser?.id, month]);

  useEffect(() => {
    if (myStatus === 'failed') toast.error('Không thể tải bảng lương.');
  }, [myStatus]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Lương Của Tôi</h3>
        <DatePicker
          picker="month"
          value={month}
          onChange={(value) => setMonth(value || dayjs())}
          format="MM/YYYY"
          allowClear={false}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : (
        myPayroll && (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="shadow-sm">
                <Statistic title="Số buổi dạy hoàn thành" value={myPayroll.sessions_completed} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="shadow-sm">
                <Statistic title="Đơn giá / buổi" value={myPayroll.rate_per_session} formatter={(v) => formatCurrency(v)} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="shadow-sm border-primary">
                <Statistic
                  title={`Tổng lương tháng ${myPayroll.month}/${myPayroll.year}`}
                  value={myPayroll.total_pay}
                  formatter={(v) => formatCurrency(v)}
                  valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        )
      )}
    </div>
  );
};

export default TeacherPayrollPage;

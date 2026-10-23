import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Card, Statistic, Select, Spin, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchDashboardOverview, fetchRevenueTrend } from '@/redux/slices/dashboardSlice.jsx';
import { formatCurrency, formatMonthYear, formatPercent } from '@/common/utils/format.js';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { overview, overviewStatus, overviewError, revenueTrend, revenueTrendStatus, revenueTrendError } =
    useSelector((state) => state.dashboard);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchRevenueTrend(months));
  }, [dispatch, months]);

  useEffect(() => {
    if (overviewStatus === 'failed') {
      toast.error(overviewError || 'Không thể tải số liệu tổng quan.');
    }
  }, [overviewStatus, overviewError]);

  useEffect(() => {
    if (revenueTrendStatus === 'failed') {
      toast.error(revenueTrendError || 'Không thể tải xu hướng doanh thu.');
    }
  }, [revenueTrendStatus, revenueTrendError]);

  const maxRevenue = Math.max(1, ...revenueTrend.map((item) => Number(item.revenue) || 0));

  const stats = overview
    ? [
        { title: 'Học viên đang hoạt động', value: overview.total_students },
        { title: 'Giáo viên đang hoạt động', value: overview.total_teachers },
        { title: 'Lớp đang hoạt động', value: overview.active_classes },
        { title: 'Lead mới tháng này', value: overview.new_leads_this_month },
        { title: 'Doanh thu tháng này', value: formatCurrency(overview.revenue_this_month) },
        { title: 'Tỷ lệ điểm danh tháng này', value: formatPercent(overview.attendance_rate_this_month) },
        { title: 'Tỷ lệ nghỉ học', value: formatPercent(overview.dropout_rate) },
      ]
    : [];

  return (
    <div>
      <h2 className="fw-bold text-dark mb-1">Chào mừng, {user?.full_name}!</h2>
      <p className="text-muted mb-4">Tổng quan hệ thống Trung tâm Ngoại ngữ Xuân Lộc.</p>

      {overviewStatus === 'loading' && (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      )}

      {overviewStatus === 'succeeded' && (
        <Row className="gy-3 mb-4">
          {stats.map((stat) => (
            <Col key={stat.title} xs={12} sm={6} lg={4} xl={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Statistic title={stat.title} value={stat.value} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Card className="border-0 shadow-sm rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold text-dark mb-0">Xu Hướng Doanh Thu</h5>
          <Select
            value={months}
            onChange={setMonths}
            style={{ width: 160 }}
            options={[
              { value: 3, label: '3 tháng gần nhất' },
              { value: 6, label: '6 tháng gần nhất' },
              { value: 12, label: '12 tháng gần nhất' },
              { value: 24, label: '24 tháng gần nhất' },
            ]}
          />
        </div>

        {revenueTrendStatus === 'loading' && (
          <div className="text-center py-4">
            <Spin />
          </div>
        )}

        {revenueTrendStatus === 'succeeded' && revenueTrend.length === 0 && (
          <Empty description="Chưa có dữ liệu doanh thu" />
        )}

        {revenueTrend.length > 0 && (
          <div className="d-flex flex-column gap-2">
            {revenueTrend.map((item) => (
              <div key={item.month} className="d-flex align-items-center gap-3">
                <div className="text-muted small" style={{ width: 70 }}>
                  {formatMonthYear(item.month)}
                </div>
                <div className="flex-grow-1 bg-light rounded-pill" style={{ height: 20 }}>
                  <div
                    className="bg-primary rounded-pill"
                    style={{
                      height: 20,
                      width: `${(Number(item.revenue) / maxRevenue) * 100}%`,
                      minWidth: Number(item.revenue) > 0 ? 4 : 0,
                    }}
                  />
                </div>
                <div className="text-end small fw-medium" style={{ width: 130 }}>
                  {formatCurrency(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboardPage;

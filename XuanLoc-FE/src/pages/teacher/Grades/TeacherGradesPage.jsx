import { useEffect, useMemo, useState } from 'react';
import { Table, Select, Button, Modal, Form, Input, InputNumber, Empty, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMyTaughtClasses } from '@/redux/slices/classesSlice.jsx';
import { fetchEnrollmentsByClass, addGrade } from '@/redux/slices/enrollmentsSlice.jsx';

const TeacherGradesPage = () => {
  const dispatch = useDispatch();
  const { myTaughtItems: classes } = useSelector((state) => state.classes);
  const { byClassItems: enrollments, byClassStatus } = useSelector((state) => state.enrollments);
  const loading = byClassStatus === 'loading';

  const [classId, setClassId] = useState(null);
  const [gradingEnrollment, setGradingEnrollment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchMyTaughtClasses());
  }, [dispatch]);

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: c.class_name })), [classes]);

  const handleClassChange = (value) => {
    setClassId(value);
    dispatch(fetchEnrollmentsByClass(value));
  };

  const handleAddGrade = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(addGrade({ enrollment_id: gradingEnrollment.id, ...values }));
    setSubmitting(false);
    if (addGrade.fulfilled.match(resultAction)) {
      toast.success('Nhập điểm thành công.');
      setGradingEnrollment(null);
      form.resetFields();
    } else {
      toast.error(resultAction.payload || 'Không thể nhập điểm.');
    }
  };

  const columns = [
    { title: 'Học viên', key: 'student', render: (_, r) => r.users?.full_name },
    { title: 'Email', key: 'email', render: (_, r) => r.users?.email },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Button size="small" type="primary" onClick={() => setGradingEnrollment(r)}>
          + Thêm điểm
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Nhập Điểm</h3>

      <Space className="mb-3">
        <Select
          placeholder="Chọn lớp học"
          style={{ width: 220 }}
          options={classOptions}
          value={classId}
          onChange={handleClassChange}
        />
      </Space>

      {!classId ? (
        <Empty description="Vui lòng chọn lớp học để nhập điểm" />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={enrollments}
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'Lớp học chưa có học viên đang theo học' }}
        />
      )}

      <Modal
        title={`Thêm điểm — ${gradingEnrollment?.users?.full_name || ''}`}
        open={!!gradingEnrollment}
        onOk={handleAddGrade}
        onCancel={() => setGradingEnrollment(null)}
        confirmLoading={submitting}
        okText="Lưu điểm"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tên bài thi/kiểm tra" rules={[{ required: true, message: 'Vui lòng nhập tên bài' }]}>
            <Input placeholder="VD: Kiểm tra giữa kỳ" />
          </Form.Item>
          <Form.Item name="score" label="Điểm (0-10)" rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}>
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="teacher_comment" label="Nhận xét">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherGradesPage;

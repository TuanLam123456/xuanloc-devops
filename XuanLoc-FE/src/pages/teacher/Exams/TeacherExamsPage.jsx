import { useEffect, useMemo, useState } from 'react';
import { Table, Button, Select, Space, Modal, Form, Input, InputNumber, Popconfirm, Switch, Card, Checkbox, Drawer, Empty, Spin, Tag } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { formatDate } from '@/common/utils/format.js';
import { fetchMyTaughtClasses } from '@/redux/slices/classesSlice.jsx';
import {
  fetchExamsByCourse,
  createExam,
  fetchExamDetail,
  updateExam,
  deleteExam,
  fetchExamSubmissions,
  clearExamDetail,
} from '@/redux/slices/examsSlice.jsx';

const emptyQuestion = () => ({ score: 1, choices: [{}, {}] });

// ---------- Modal: Tạo đề thi mới (câu hỏi + lựa chọn trắc nghiệm) ----------
const CreateExamModal = ({ open, courseId, onClose, onCreated }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    for (const q of values.questions || []) {
      const choices = q.choices || [];
      if (choices.length < 2) {
        toast.error(`Câu hỏi "${q.question_text}" cần tối thiểu 2 lựa chọn.`);
        return;
      }
      if (!choices.some((c) => c?.is_correct)) {
        toast.error(`Câu hỏi "${q.question_text}" phải có ít nhất 1 đáp án đúng.`);
        return;
      }
    }

    setSubmitting(true);
    const resultAction = await dispatch(
      createExam({
        course_id: courseId,
        title: values.title,
        description: values.description,
        duration_minutes: values.duration_minutes,
        questions: values.questions,
      }),
    );
    setSubmitting(false);
    if (createExam.fulfilled.match(resultAction)) {
      toast.success('Tạo đề thi thành công.');
      form.resetFields();
      onCreated?.();
    } else {
      toast.error(resultAction.payload || 'Không thể tạo đề thi.');
    }
  };

  return (
    <Modal
      title="Tạo đề thi mới"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      okText="Tạo đề thi"
      cancelText="Hủy"
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={{ questions: [emptyQuestion()] }}>
        <Form.Item name="title" label="Tên đề thi" rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}>
          <Input placeholder="VD: Kiểm tra giữa khóa - Ngữ pháp" />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="duration_minutes" label="Thời gian làm bài (phút)">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, qIdx) => (
                <Card
                  key={field.key}
                  size="small"
                  className="mb-3"
                  title={`Câu hỏi ${qIdx + 1}`}
                  extra={
                    fields.length > 1 && (
                      <Button type="text" danger size="small" onClick={() => remove(field.name)}>
                        Xóa câu
                      </Button>
                    )
                  }
                >
                  <Form.Item
                    name={[field.name, 'question_text']}
                    label="Nội dung câu hỏi"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                  <Form.Item name={[field.name, 'score']} label="Điểm">
                    <InputNumber min={0.1} step={0.5} style={{ width: 120 }} />
                  </Form.Item>

                  <Form.List name={[field.name, 'choices']}>
                    {(choiceFields, { add: addChoice, remove: removeChoice }) => (
                      <>
                        <label className="d-block mb-2 small text-muted">
                          Các lựa chọn (tick vào ô vuông để đánh dấu đáp án đúng)
                        </label>
                        {choiceFields.map((choiceField) => (
                          <Space key={choiceField.key} className="d-flex mb-2" align="baseline">
                            <Form.Item name={[choiceField.name, 'is_correct']} valuePropName="checked" noStyle>
                              <Checkbox />
                            </Form.Item>
                            <Form.Item
                              name={[choiceField.name, 'choice_text']}
                              rules={[{ required: true, message: 'Nhập nội dung lựa chọn' }]}
                              noStyle
                            >
                              <Input placeholder="Nội dung lựa chọn" style={{ width: 380 }} />
                            </Form.Item>
                            {choiceFields.length > 2 && (
                              <MinusCircleOutlined onClick={() => removeChoice(choiceField.name)} />
                            )}
                          </Space>
                        ))}
                        <Button type="dashed" size="small" onClick={() => addChoice()} icon={<PlusOutlined />}>
                          Thêm lựa chọn
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Card>
              ))}
              <Button type="dashed" block onClick={() => add(emptyQuestion())} icon={<PlusOutlined />}>
                Thêm câu hỏi
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

// ---------- Drawer: Xem chi tiết đề thi (đáp án đúng được tô sáng) ----------
const ExamDetailDrawer = ({ examId, onClose }) => {
  const dispatch = useDispatch();
  const { detail, detailStatus } = useSelector((state) => state.exams);

  useEffect(() => {
    if (examId) dispatch(fetchExamDetail(examId));
    return () => {
      dispatch(clearExamDetail());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  return (
    <Drawer title={detail?.title ? `Chi tiết đề thi — ${detail.title}` : 'Chi tiết đề thi'} open={!!examId} onClose={onClose} size={560}>
      {detailStatus === 'loading' ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : (
        detail && (
          <div>
            {detail.description && <p className="text-muted">{detail.description}</p>}
            {(detail.exam_questions || []).map((q, idx) => (
              <Card key={q.id} size="small" className="mb-3" title={`Câu ${idx + 1} (${Number(q.score)} điểm)`}>
                <p className="fw-semibold">{q.question_text}</p>
                {(q.exam_choices || []).map((c) => (
                  <div
                    key={c.id}
                    className={`px-2 py-1 mb-1 rounded ${c.is_correct ? 'bg-success-subtle text-success-emphasis fw-semibold' : ''}`}
                  >
                    {c.is_correct ? '✓ ' : '— '}
                    {c.choice_text}
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )
      )}
    </Drawer>
  );
};

// ---------- Drawer: Danh sách bài nộp ----------
const SubmissionsDrawer = ({ exam, onClose }) => {
  const dispatch = useDispatch();
  const { submissions, submissionsStatus } = useSelector((state) => state.exams);

  useEffect(() => {
    if (exam) dispatch(fetchExamSubmissions(exam.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  return (
    <Drawer title={exam ? `Bài nộp — ${exam.title}` : 'Bài nộp'} open={!!exam} onClose={onClose} size={480}>
      {submissionsStatus === 'loading' ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : submissions.length === 0 ? (
        <Empty description="Chưa có học viên nào nộp bài" />
      ) : (
        submissions.map((s) => (
          <div key={s.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
            <div>
              <div className="fw-semibold">{s.users?.full_name}</div>
              <div className="text-muted small">{s.users?.email}</div>
              <div className="text-muted small">{formatDate(s.submitted_at)}</div>
            </div>
            <Tag color="blue" style={{ fontSize: 14 }}>
              {Number(s.score)} điểm
            </Tag>
          </div>
        ))
      )}
    </Drawer>
  );
};

// ---------- Modal: Sửa thông tin cơ bản ----------
const EditExamModal = ({ exam, onClose, onSaved }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (exam) form.setFieldsValue(exam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(updateExam({ id: exam.id, payload: values }));
    setSubmitting(false);
    if (updateExam.fulfilled.match(resultAction)) {
      toast.success('Cập nhật đề thi thành công.');
      onSaved?.();
    } else {
      toast.error(resultAction.payload || 'Không thể cập nhật đề thi.');
    }
  };

  return (
    <Modal
      title="Sửa đề thi"
      open={!!exam}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tên đề thi" rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="duration_minutes" label="Thời gian làm bài (phút)">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Đang mở" unCheckedChildren="Đã đóng" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ---------- Trang chính ----------
const TeacherExamsPage = () => {
  const dispatch = useDispatch();
  const { myTaughtItems: classes } = useSelector((state) => state.classes);
  const { items, listStatus } = useSelector((state) => state.exams);
  const loading = listStatus === 'loading';

  const [courseId, setCourseId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailExamId, setDetailExamId] = useState(null);
  const [submissionsExam, setSubmissionsExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyTaughtClasses());
  }, [dispatch]);

  // Chỉ cho phép chọn khóa học có ít nhất 1 lớp mình đang dạy (loại trùng theo course_id)
  const courseOptions = useMemo(() => {
    const map = new Map();
    classes.forEach((c) => {
      if (c.courses && !map.has(c.course_id)) map.set(c.course_id, c.courses.title);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [classes]);

  const loadExams = (cId) => {
    if (cId) dispatch(fetchExamsByCourse(cId));
  };

  useEffect(() => {
    if (listStatus === 'failed' && courseId) {
      toast.error('Không thể tải danh sách đề thi.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStatus]);

  const handleToggleActive = async (exam) => {
    setBusyId(exam.id);
    const resultAction = await dispatch(updateExam({ id: exam.id, payload: { is_active: !exam.is_active } }));
    setBusyId(null);
    if (!updateExam.fulfilled.match(resultAction)) {
      toast.error(resultAction.payload || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (exam) => {
    setBusyId(exam.id);
    const resultAction = await dispatch(deleteExam(exam.id));
    setBusyId(null);
    if (deleteExam.fulfilled.match(resultAction)) {
      toast.success('Đã xóa đề thi.');
    } else {
      toast.error(resultAction.payload || 'Không thể xóa đề thi.');
    }
  };

  const columns = [
    { title: 'Tên đề thi', dataIndex: 'title' },
    { title: 'Số câu hỏi', key: 'count', width: 110, align: 'center', render: (_, r) => r._count?.exam_questions ?? '—' },
    { title: 'Thời gian (phút)', dataIndex: 'duration_minutes', width: 130, align: 'center', render: (v) => v ?? '—' },
    { title: 'Ngày tạo', dataIndex: 'created_at', width: 120, render: formatDate },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 130,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          loading={busyId === record.id}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Đang mở"
          unCheckedChildren="Đã đóng"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 300,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => setDetailExamId(record.id)}>
            Xem đề
          </Button>
          <Button size="small" onClick={() => setSubmissionsExam(record)}>
            Bài nộp
          </Button>
          <Button size="small" onClick={() => setEditingExam(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa đề thi?"
            description="Toàn bộ câu hỏi và bài nộp liên quan sẽ bị xóa. Không thể hoàn tác."
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger loading={busyId === record.id}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="fw-bold text-dark mb-0">Đề Thi</h3>
        <Button type="primary" disabled={!courseId} onClick={() => setCreateModalOpen(true)}>
          + Tạo đề thi
        </Button>
      </div>

      <Space className="mb-3" wrap>
        <Select
          placeholder="Chọn khóa học để quản lý đề thi"
          style={{ width: 320 }}
          options={courseOptions}
          showSearch
          optionFilterProp="label"
          value={courseId}
          onChange={(value) => {
            setCourseId(value);
            loadExams(value);
          }}
        />
      </Space>

      {!courseId ? (
        <Empty description="Vui lòng chọn khóa học để xem danh sách đề thi" />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} />
      )}

      <CreateExamModal
        open={createModalOpen}
        courseId={courseId}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setCreateModalOpen(false);
          loadExams(courseId);
        }}
      />

      <ExamDetailDrawer examId={detailExamId} onClose={() => setDetailExamId(null)} />
      <SubmissionsDrawer exam={submissionsExam} onClose={() => setSubmissionsExam(null)} />
      <EditExamModal
        exam={editingExam}
        onClose={() => setEditingExam(null)}
        onSaved={() => setEditingExam(null)}
      />
    </div>
  );
};

export default TeacherExamsPage;

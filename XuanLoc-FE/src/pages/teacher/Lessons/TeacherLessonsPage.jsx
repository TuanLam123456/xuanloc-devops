import { useEffect, useMemo, useState } from 'react';
import { Card, Select, Button, Modal, Form, Input, DatePicker, Tag, Empty, Space, Popconfirm, List } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { formatDate } from '@/common/utils/format.js';
import { fetchMyTaughtClasses } from '@/redux/slices/classesSlice.jsx';
import {
  fetchLessonsByCourse,
  fetchClassLessonsProgress,
  updateClassLessonStatus,
  addLessonMaterial,
  deleteLessonMaterial,
} from '@/redux/slices/lessonsSlice.jsx';

const STATUS_LABELS = { pending: 'Chưa dạy', completed: 'Đã dạy', skipped: 'Bỏ qua' };
const STATUS_COLORS = { pending: 'default', completed: 'green', skipped: 'orange' };

const TeacherLessonsPage = () => {
  const dispatch = useDispatch();
  const { myTaughtItems: classes } = useSelector((state) => state.classes);
  const { items: lessons, listStatus, progress } = useSelector((state) => state.lessons);
  const loading = listStatus === 'loading';

  const [classId, setClassId] = useState(null);
  const [progressLesson, setProgressLesson] = useState(null);
  const [materialLessonId, setMaterialLessonId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progressForm] = Form.useForm();
  const [materialForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchMyTaughtClasses());
  }, [dispatch]);

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: c.class_name, courseId: c.course_id })), [classes]);

  const handleClassChange = (value) => {
    setClassId(value);
    const found = classOptions.find((c) => c.value === value);
    if (found?.courseId) dispatch(fetchLessonsByCourse(found.courseId));
    dispatch(fetchClassLessonsProgress(value));
  };

  const progressByLessonId = useMemo(() => {
    const map = new Map();
    progress.forEach((p) => map.set(p.lesson_id, p));
    return map;
  }, [progress]);

  const openProgressModal = (lesson) => {
    const existing = progressByLessonId.get(lesson.id);
    setProgressLesson(lesson);
    progressForm.setFieldsValue({
      status: existing?.status || 'completed',
      taught_date: existing?.taught_date ? dayjs(existing.taught_date) : dayjs(),
      homework_assigned: existing?.homework_assigned || '',
    });
  };

  const handleSaveProgress = async () => {
    let values;
    try {
      values = await progressForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(
      updateClassLessonStatus({
        class_id: classId,
        lesson_id: progressLesson.id,
        status: values.status,
        taught_date: values.taught_date.format('YYYY-MM-DD'),
        homework_assigned: values.homework_assigned,
      }),
    );
    setSubmitting(false);
    if (updateClassLessonStatus.fulfilled.match(resultAction)) {
      toast.success('Cập nhật tiến độ thành công.');
      setProgressLesson(null);
    } else {
      toast.error(resultAction.payload || 'Không thể cập nhật tiến độ.');
    }
  };

  const handleAddMaterial = async () => {
    let values;
    try {
      values = await materialForm.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    const resultAction = await dispatch(addLessonMaterial({ lessonId: materialLessonId, ...values }));
    setSubmitting(false);
    if (addLessonMaterial.fulfilled.match(resultAction)) {
      toast.success('Thêm tài liệu thành công.');
      setMaterialLessonId(null);
      materialForm.resetFields();
    } else {
      toast.error(resultAction.payload || 'Không thể thêm tài liệu.');
    }
  };

  const handleDeleteMaterial = async (id) => {
    const resultAction = await dispatch(deleteLessonMaterial(id));
    if (deleteLessonMaterial.fulfilled.match(resultAction)) {
      toast.success('Đã xóa tài liệu.');
    } else {
      toast.error(resultAction.payload || 'Không thể xóa tài liệu.');
    }
  };

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Bài Giảng &amp; Tài Liệu</h3>

      <Select
        placeholder="Chọn lớp học"
        style={{ width: 260 }}
        className="mb-4"
        options={classOptions}
        value={classId}
        onChange={handleClassChange}
      />

      {!classId ? (
        <Empty description="Vui lòng chọn lớp học để quản lý bài giảng" />
      ) : loading ? null : lessons.length === 0 ? (
        <Empty description="Khóa học này chưa có bài giảng nào (liên hệ Admin để tạo bài giảng)" />
      ) : (
        lessons.map((lesson) => {
          const p = progressByLessonId.get(lesson.id);
          const status = p?.status || 'pending';
          return (
            <Card
              key={lesson.id}
              className="mb-3 shadow-sm"
              title={`Bài ${lesson.lesson_number}: ${lesson.title}`}
              extra={<Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>}
            >
              {lesson.description && <p className="text-muted">{lesson.description}</p>}
              {p?.taught_date && (
                <p className="small text-muted mb-1">Ngày dạy: {formatDate(p.taught_date)}</p>
              )}
              {p?.homework_assigned && (
                <p className="small mb-2">
                  <strong>Bài tập về nhà:</strong> {p.homework_assigned}
                </p>
              )}

              <Space className="mb-3">
                <Button size="small" onClick={() => openProgressModal(lesson)}>
                  Cập nhật tiến độ
                </Button>
                <Button size="small" onClick={() => setMaterialLessonId(lesson.id)}>
                  + Thêm tài liệu
                </Button>
              </Space>

              {lesson.lesson_materials?.length > 0 && (
                <List
                  size="small"
                  bordered
                  dataSource={lesson.lesson_materials}
                  renderItem={(m) => (
                    <List.Item
                      actions={[
                        <Popconfirm key="del" title="Xóa tài liệu?" okText="Xóa" okType="danger" cancelText="Hủy" onConfirm={() => handleDeleteMaterial(m.id)}>
                          <Button size="small" danger type="text">
                            Xóa
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                        {m.file_title}
                      </a>
                      {m.file_type && <Tag className="ms-2">{m.file_type}</Tag>}
                    </List.Item>
                  )}
                />
              )}
            </Card>
          );
        })
      )}

      <Modal
        title={`Cập nhật tiến độ — Bài ${progressLesson?.lesson_number || ''}`}
        open={!!progressLesson}
        onOk={handleSaveProgress}
        onCancel={() => setProgressLesson(null)}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={progressForm} layout="vertical">
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'pending', label: 'Chưa dạy' },
                { value: 'completed', label: 'Đã dạy' },
                { value: 'skipped', label: 'Bỏ qua' },
              ]}
            />
          </Form.Item>
          <Form.Item name="taught_date" label="Ngày dạy" rules={[{ required: true, message: 'Vui lòng chọn ngày dạy' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="homework_assigned" label="Bài tập về nhà">
            <Input.TextArea rows={3} placeholder="Dặn dò bài tập về nhà cho học viên..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm tài liệu học tập"
        open={!!materialLessonId}
        onOk={handleAddMaterial}
        onCancel={() => setMaterialLessonId(null)}
        confirmLoading={submitting}
        okText="Thêm"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={materialForm} layout="vertical">
          <Form.Item name="file_title" label="Tên tài liệu" rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu' }]}>
            <Input placeholder="VD: Slide bài giảng Unit 1" />
          </Form.Item>
          <Form.Item
            name="file_url"
            label="Đường dẫn (Google Drive, YouTube...)"
            rules={[{ required: true, message: 'Vui lòng nhập đường dẫn' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="file_type" label="Loại tài liệu">
            <Input placeholder="VD: PDF, Video, Slide..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherLessonsPage;

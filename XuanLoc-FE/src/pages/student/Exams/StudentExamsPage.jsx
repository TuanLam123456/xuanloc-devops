import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Button, Select, Empty, Spin, Tag, Radio, Space, Result, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMyEnrollments } from '@/redux/slices/enrollmentsSlice.jsx';
import {
  fetchExamsByCourse,
  fetchExamForTaking,
  submitExam,
  clearExamTaking,
} from '@/redux/slices/examsSlice.jsx';

// ---------- Màn hình làm bài + nộp bài ----------
const TakeExamView = ({ examId, onExit }) => {
  const dispatch = useDispatch();
  const { examForTaking, takingStatus, takingError, submitResult, submitStatus } = useSelector((state) => state.exams);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    dispatch(fetchExamForTaking(examId));
    return () => {
      dispatch(clearExamTaking());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  useEffect(() => {
    if (takingStatus === 'failed') {
      toast.error(takingError || 'Không thể tải đề thi.');
      onExit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [takingStatus]);

  const handleSubmit = async () => {
    const answerList = Object.entries(answers).map(([question_id, choice_id]) => ({
      question_id: Number(question_id),
      choice_id,
    }));
    const resultAction = await dispatch(submitExam({ id: examId, answers: answerList }));
    if (!submitExam.fulfilled.match(resultAction)) {
      toast.error(resultAction.payload || 'Không thể nộp bài.');
    }
  };

  if (takingStatus === 'loading' || takingStatus === 'idle') {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  if (submitResult) {
    return (
      <Card className="shadow-sm">
        <Result
          status={submitResult.score >= submitResult.total_score / 2 ? 'success' : 'info'}
          title={`Bạn đạt ${submitResult.score}/${submitResult.total_score} điểm`}
          subTitle="Kết quả chi tiết từng câu hỏi bên dưới"
        />
        {submitResult.results.map((r, idx) => (
          <div key={r.question_id} className={`p-2 mb-2 rounded ${r.is_correct ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
            <strong>
              Câu {idx + 1}: {r.is_correct ? '✓ Đúng' : '✗ Sai'}
            </strong>
            <div className="small text-muted">{r.question_text}</div>
          </div>
        ))}
        <Button type="primary" className="mt-2" onClick={onExit}>
          Quay lại danh sách đề thi
        </Button>
      </Card>
    );
  }

  if (!examForTaking) return null;

  return (
    <Card className="shadow-sm">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h4 className="fw-bold mb-1">{examForTaking.title}</h4>
          {examForTaking.description && <p className="text-muted mb-0">{examForTaking.description}</p>}
        </div>
        <Button onClick={onExit}>Thoát</Button>
      </div>

      {examForTaking.exam_questions.map((q, idx) => (
        <div key={q.id} className="mb-4">
          <p className="fw-semibold">
            Câu {idx + 1} ({Number(q.score)} điểm): {q.question_text}
          </p>
          <Radio.Group
            value={answers[q.id]}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          >
            <Space direction="vertical">
              {q.exam_choices.map((c) => (
                <Radio key={c.id} value={c.id}>
                  {c.choice_text}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      ))}

      <Divider />
      <Button
        type="primary"
        size="large"
        loading={submitStatus === 'loading'}
        disabled={Object.keys(answers).length !== examForTaking.exam_questions.length}
        onClick={handleSubmit}
      >
        Nộp bài
      </Button>
      {Object.keys(answers).length !== examForTaking.exam_questions.length && (
        <span className="ms-2 text-muted small">Vui lòng trả lời hết các câu hỏi trước khi nộp bài.</span>
      )}
    </Card>
  );
};

// ---------- Trang chính ----------
const StudentExamsPage = () => {
  const dispatch = useDispatch();
  const { myItems: enrollments } = useSelector((state) => state.enrollments);
  const { items: exams, listStatus } = useSelector((state) => state.exams);
  const loading = listStatus === 'loading';

  const [classId, setClassId] = useState(null);
  const [takingExamId, setTakingExamId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const classOptions = useMemo(
    () => enrollments.map((e) => ({ value: e.class_id, label: e.classes?.class_name, courseId: e.classes?.course_id })),
    [enrollments],
  );

  const handleClassChange = (value) => {
    setClassId(value);
    const found = classOptions.find((c) => c.value === value);
    if (found?.courseId) dispatch(fetchExamsByCourse(found.courseId));
  };

  if (takingExamId) {
    return <TakeExamView examId={takingExamId} onExit={() => setTakingExamId(null)} />;
  }

  return (
    <div>
      <h3 className="fw-bold text-dark mb-3">Đề Thi</h3>

      <Select
        placeholder="Chọn lớp học để xem đề thi"
        style={{ width: 320 }}
        className="mb-4"
        options={classOptions}
        value={classId}
        onChange={handleClassChange}
      />

      {!classId ? (
        <Empty description="Vui lòng chọn lớp học để xem danh sách đề thi" />
      ) : loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : exams.length === 0 ? (
        <Empty description="Khóa học này hiện chưa có đề thi nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {exams.map((exam) => (
            <Col xs={24} md={12} lg={8} key={exam.id}>
              <Card className="h-100 shadow-sm" title={exam.title}>
                {exam.description && <p className="text-muted small">{exam.description}</p>}
                <Space className="mb-3" wrap>
                  <Tag>{exam._count?.exam_questions ?? 0} câu hỏi</Tag>
                  {exam.duration_minutes && <Tag color="blue">{exam.duration_minutes} phút</Tag>}
                </Space>
                <Button type="primary" block onClick={() => setTakingExamId(exam.id)}>
                  Làm bài
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default StudentExamsPage;

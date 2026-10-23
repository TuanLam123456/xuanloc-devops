import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";

// Chỉ học viên có ghi danh (chưa soft-delete) vào 1 lớp thuộc khóa học mới được xem/làm bài kiểm tra của khóa đó
const assertStudentEnrolledInCourse = async (studentId, courseId) => {
  const enrollment = await prisma.enrollments.findFirst({
    where: { student_id: studentId, deleted_at: null, classes: { course_id: courseId } },
  });
  if (!enrollment) {
    throw new ForbiddenError("Bạn cần ghi danh vào khóa học này để làm bài kiểm tra.");
  }
};

export const examService = {
  // Admin/Giáo viên: tạo bài kiểm tra trắc nghiệm kèm câu hỏi + lựa chọn trong 1 lượt
  createExam: async (body) => {
    const { course_id, title, description, duration_minutes, questions } = body;

    if (!course_id || !title || !Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestError(
        "Vui lòng cung cấp course_id, title và danh sách questions (tối thiểu 1 câu).",
      );
    }

    const cId = Number(course_id);
    const course = await prisma.courses.findUnique({ where: { id: cId } });
    if (!course) throw new NotFoundError("Khóa học không tồn tại.");

    for (const q of questions) {
      if (!q.question_text || !Array.isArray(q.choices) || q.choices.length < 2) {
        throw new BadRequestError("Mỗi câu hỏi cần question_text và tối thiểu 2 lựa chọn.");
      }
      if (!q.choices.some((c) => c.is_correct)) {
        throw new BadRequestError(`Câu hỏi "${q.question_text}" phải có ít nhất 1 đáp án đúng.`);
      }
    }

    return await prisma.$transaction(async (tx) => {
      const exam = await tx.exams.create({
        data: {
          course_id: cId,
          title,
          description: description || null,
          duration_minutes: duration_minutes ? Number(duration_minutes) : null,
        },
      });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const question = await tx.exam_questions.create({
          data: {
            exam_id: exam.id,
            question_text: q.question_text,
            score: q.score ? Number(q.score) : 1.0,
            order_index: i,
          },
        });

        await tx.exam_choices.createMany({
          data: q.choices.map((c, j) => ({
            question_id: question.id,
            choice_text: c.choice_text,
            is_correct: !!c.is_correct,
            order_index: j,
          })),
        });
      }

      return exam;
    });
  },

  // Danh sách bài kiểm tra theo khóa học (học viên chỉ thấy bài đang mở + phải đã ghi danh)
  getExamsByCourse: async (courseId, requestingUser) => {
    const cId = Number(courseId);
    if (!cId || isNaN(cId)) throw new BadRequestError("ID khóa học không hợp lệ.");

    const isStaff = ["admin", "teacher"].includes(requestingUser?.role);
    if (!isStaff) {
      await assertStudentEnrolledInCourse(requestingUser?.id, cId);
    }

    return await prisma.exams.findMany({
      where: { course_id: cId, ...(isStaff ? {} : { is_active: true }) },
      select: {
        id: true,
        title: true,
        description: true,
        duration_minutes: true,
        is_active: true,
        created_at: true,
        _count: { select: { exam_questions: true } },
      },
      orderBy: { created_at: "desc" },
    });
  },

  // Admin/Giáo viên: xem đầy đủ bài kiểm tra kèm đáp án đúng
  getExamDetailByAdmin: async (examId) => {
    const eId = Number(examId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID bài kiểm tra không hợp lệ.");

    const exam = await prisma.exams.findUnique({
      where: { id: eId },
      include: {
        exam_questions: {
          orderBy: { order_index: "asc" },
          include: { exam_choices: { orderBy: { order_index: "asc" } } },
        },
      },
    });
    if (!exam) throw new NotFoundError("Không tìm thấy bài kiểm tra.");

    return exam;
  },

  // Học viên: lấy đề để làm bài (không kèm đáp án đúng)
  getExamForTaking: async (examId, studentId) => {
    const eId = Number(examId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID bài kiểm tra không hợp lệ.");

    const exam = await prisma.exams.findUnique({
      where: { id: eId },
      include: {
        exam_questions: {
          orderBy: { order_index: "asc" },
          include: {
            exam_choices: {
              orderBy: { order_index: "asc" },
              select: { id: true, choice_text: true },
            },
          },
        },
      },
    });
    if (!exam || !exam.is_active) throw new NotFoundError("Không tìm thấy bài kiểm tra.");

    await assertStudentEnrolledInCourse(studentId, exam.course_id);

    const existingSubmission = await prisma.exam_submissions.findUnique({
      where: { exam_id_student_id: { exam_id: eId, student_id: studentId } },
    });
    if (existingSubmission) {
      throw new BadRequestError("Bạn đã làm bài kiểm tra này rồi.");
    }

    return exam;
  },

  // Học viên: nộp bài, tự động chấm điểm
  submitExam: async (examId, studentId, answers) => {
    const eId = Number(examId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID bài kiểm tra không hợp lệ.");
    if (!Array.isArray(answers)) throw new BadRequestError("Vui lòng cung cấp answers.");

    const exam = await prisma.exams.findUnique({
      where: { id: eId },
      include: { exam_questions: { include: { exam_choices: true } } },
    });
    if (!exam || !exam.is_active) throw new NotFoundError("Không tìm thấy bài kiểm tra.");

    await assertStudentEnrolledInCourse(studentId, exam.course_id);

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.exam_submissions.findUnique({
        where: { exam_id_student_id: { exam_id: eId, student_id: studentId } },
      });
      if (existing) throw new BadRequestError("Bạn đã nộp bài kiểm tra này rồi.");

      let totalScore = 0;
      const answerRows = [];
      const results = [];

      for (const question of exam.exam_questions) {
        const answer = answers.find((a) => Number(a.question_id) === question.id);
        const selectedChoiceId = answer?.choice_id != null ? Number(answer.choice_id) : null;
        const selectedChoice = question.exam_choices.find((c) => c.id === selectedChoiceId);
        const isCorrect = !!selectedChoice?.is_correct;
        if (isCorrect) totalScore += Number(question.score);

        answerRows.push({ question_id: question.id, choice_id: selectedChoiceId });
        results.push({
          question_id: question.id,
          question_text: question.question_text,
          selected_choice_id: selectedChoiceId,
          is_correct: isCorrect,
          correct_choice_id: question.exam_choices.find((c) => c.is_correct)?.id ?? null,
        });
      }

      const submission = await tx.exam_submissions.create({
        data: { exam_id: eId, student_id: studentId, score: totalScore },
      });

      await tx.submission_answers.createMany({
        data: answerRows.map((a) => ({
          submission_id: submission.id,
          question_id: a.question_id,
          choice_id: a.choice_id,
        })),
      });

      return {
        submission_id: submission.id,
        score: totalScore,
        total_score: exam.exam_questions.reduce((sum, q) => sum + Number(q.score), 0),
        results,
      };
    });
  },

  // Admin/Giáo viên: danh sách bài đã nộp của 1 bài kiểm tra
  getSubmissionsByAdmin: async (examId) => {
    const eId = Number(examId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID bài kiểm tra không hợp lệ.");

    return await prisma.exam_submissions.findMany({
      where: { exam_id: eId },
      include: { users: { select: { id: true, full_name: true, email: true } } },
      orderBy: { submitted_at: "desc" },
    });
  },

  // Admin: sửa thông tin cơ bản (không sửa lại cấu trúc câu hỏi để tránh vỡ dữ liệu bài đã nộp)
  updateExamByAdmin: async (id, body) => {
    const examId = Number(id);
    if (!examId || isNaN(examId)) throw new BadRequestError("ID bài kiểm tra không hợp lệ.");

    const { title, description, duration_minutes, is_active } = body;

    const exam = await prisma.exams.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundError("Không tìm thấy bài kiểm tra.");

    return await prisma.exams.update({
      where: { id: examId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(duration_minutes !== undefined && {
          duration_minutes: duration_minutes != null ? Number(duration_minutes) : null,
        }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });
  },

  deleteExamByAdmin: async (id) => {
    const examId = Number(id);
    if (!examId || isNaN(examId)) throw new BadRequestError("ID bài kiểm tra không hợp lệ.");

    const exam = await prisma.exams.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundError("Không tìm thấy bài kiểm tra để xóa.");

    await prisma.exams.delete({ where: { id: examId } });
    return true;
  },
};

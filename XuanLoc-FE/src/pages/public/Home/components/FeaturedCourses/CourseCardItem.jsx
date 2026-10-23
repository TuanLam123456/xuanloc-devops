import { Card } from "react-bootstrap";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const CourseCardItem = ({ course }) => {
  const navigate = useNavigate();

  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column">
      {/* Header Visual */}
      <div
        className="d-flex align-items-center justify-content-center position-relative text-white flex-shrink-0"
        style={{
          height: "160px",
          background: "linear-gradient(135deg, #0d6efd 0%, #0044cc 100%)",
        }}
      >
        <div className="text-center">
          <i
            className="bi bi-mortarboard fs-1 opacity-75 d-block mb-1"
            aria-hidden="true"
          ></i>
          <span className="fw-bold tracking-wide small text-uppercase opacity-90">
            {course.code || "COURSE"}
          </span>
        </div>

        <span
          className="position-absolute top-0 end-0 m-3 badge bg-white text-primary fw-semibold px-2 py-1 rounded-pill shadow-sm"
          style={{ fontSize: "11px" }}
        >
          <i className="bi bi-clock me-1" aria-hidden="true"></i>
          {course.duration_months
            ? `${course.duration_months} tháng`
            : "Đang cập nhật"}
        </span>
      </div>

      {/* Card Body */}
      <Card.Body className="d-flex flex-column p-4 flex-grow-1">
        <div className="mb-2">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
            {course.code}
          </span>
        </div>

        {/* Tiêu đề cố định min-height 2 dòng */}
        <Card.Title
          className="fw-bold fs-5 text-dark mb-2"
          style={{
            minHeight: "3rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.title}
        </Card.Title>

        {/* Đoạn mô tả tự co giãn chiếm không gian */}
        <Card.Text
          className="text-secondary small flex-grow-1 mb-4"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description ||
            "Chương trình đào tạo chuẩn quốc tế giúp phát triển toàn diện kiến thức và kỹ năng."}
        </Card.Text>

        <hr className="text-muted opacity-25 my-0 mb-3 mt-auto" />

        {/* Footer Card */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted d-block" style={{ fontSize: "11px" }}>
              Học phí trọn gói
            </small>
            <span className="text-danger fw-bold fs-5">
              {Number.isFinite(Number(course.tuition_fee)) &&
              course.tuition_fee != null
                ? `${Number(course.tuition_fee).toLocaleString("vi-VN")} đ`
                : "Liên hệ"}
            </span>
          </div>

          <Button
            type="primary"
            shape="round"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CourseCardItem;

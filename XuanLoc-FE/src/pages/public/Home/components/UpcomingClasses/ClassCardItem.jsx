import { Card } from "react-bootstrap";
import { Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";

const ClassCardItem = ({ cls }) => {
  const navigate = useNavigate();

  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column">
      {/* Header Visual */}
      <div
        className="d-flex align-items-center justify-content-between px-4 text-white flex-shrink-0"
        style={{
          height: "110px",
          background: "linear-gradient(135deg, #0958d9 0%, #002c8c 100%)",
        }}
      >
        <div>
          <span className="badge bg-white-subtle text-white border border-white-subtle mb-1">
            {cls.courses?.code || "CLASS"}
          </span>
          <h5
            className="fw-bold mb-0 text-white text-truncate"
            style={{ maxWidth: "180px" }}
          >
            {cls.class_name}
          </h5>
        </div>

        <Tag
          color="cyan"
          className="m-0 fw-semibold px-2 py-1 rounded-pill shadow-sm"
        >
          <i className="bi bi-door-open-fill me-1" aria-hidden="true"></i>
          {cls.room || "Phòng 1"}
        </Tag>
      </div>

      {/* Card Body */}
      <Card.Body className="d-flex flex-column p-4 flex-grow-1">
        <p
          className="text-dark fw-medium small mb-3"
          style={{
            minHeight: "2.5rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <strong>Khóa học:</strong> {cls.courses?.title}
        </p>

        <div className="bg-light rounded-3 p-3 mb-3 small text-secondary flex-grow-1 d-flex flex-column justify-content-center">
          <div className="d-flex align-items-center mb-2">
            <i
              className="bi bi-calendar-event text-primary me-2 fs-6"
              aria-hidden="true"
            ></i>
            <span>
              Khai giảng:{" "}
              <strong className="text-dark">
                {cls.start_date
                  ? new Date(cls.start_date).toLocaleDateString("vi-VN")
                  : "Sắp xếp sau"}
              </strong>
            </span>
          </div>
          <div className="d-flex align-items-center">
            <i
              className="bi bi-clock-history text-primary me-2 fs-6"
              aria-hidden="true"
            ></i>
            <span>
              Lịch học:{" "}
              <strong className="text-dark">
                {cls.schedule_text || "Tối 2-4-6"}
              </strong>
            </span>
          </div>
        </div>

        <div className="mt-auto d-flex justify-content-end">
          {/* Thay vì gọi scrollToConsultation ở card, cho phép xem chi tiết hoặc đăng ký */}
          <Button
            type="primary"
            shape="round"
            onClick={() => navigate(`/classes/${cls.id}`)}
          >
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ClassCardItem;

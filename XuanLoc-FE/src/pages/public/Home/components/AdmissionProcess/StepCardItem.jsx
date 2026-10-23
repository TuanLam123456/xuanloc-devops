import { Card } from 'react-bootstrap';

const StepCardItem = ({ stepNumber, title, desc, icon }) => {
  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 p-4 text-center position-relative overflow-hidden d-flex flex-column">
      {/* Số thứ tự bước nền mờ */}
      <span
        className="position-absolute top-0 start-0 m-3 fw-bold text-primary opacity-25 user-select-none"
        style={{ fontSize: '2.5rem', lineHeight: 1 }}
      >
        0{stepNumber}
      </span>

      {/* Icon bước */}
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 bg-primary-subtle text-primary mt-2 flex-shrink-0"
        style={{ width: '56px', height: '56px', fontSize: '24px' }}
      >
        <i className={`bi ${icon}`} aria-hidden="true"></i>
      </div>

      <Card.Title
        className="fw-bold fs-6 text-dark mb-2"
        style={{ minHeight: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {title}
      </Card.Title>

      <Card.Text className="text-secondary small mb-0 flex-grow-1">
        {desc}
      </Card.Text>
    </Card>
  );
};

export default StepCardItem;
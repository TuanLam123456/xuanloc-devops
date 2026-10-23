import { Card } from 'react-bootstrap';

const FeatureCardItem = ({ icon, title, desc, tagColor }) => {
  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 p-4 text-center">
      <div
        className={`d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3 bg-${tagColor}-subtle text-${tagColor}`}
        style={{ width: '64px', height: '64px', fontSize: '28px' }}
      >
        <i className={`bi ${icon}`} aria-hidden="true"></i>
      </div>
      <Card.Title className="fw-bold fs-5 text-dark mb-2">{title}</Card.Title>
      <Card.Text className="text-secondary small mb-0">{desc}</Card.Text>
    </Card>
  );
};

export default FeatureCardItem;
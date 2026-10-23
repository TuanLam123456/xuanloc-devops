import { Card } from 'react-bootstrap';
import { Tag } from 'antd';
import { getInitials } from '@/common/utils/getInitials.js';

const InstructorCardItem = ({ name, role, degree, bio }) => {
  const initials = getInitials(name, 'GV');

  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden text-center d-flex flex-column">
      {/* Header Background */}
      <div
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ height: '90px', background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 100%)' }}
      ></div>

      {/* Avatar Fallback Container */}
      <div className="position-relative d-flex justify-content-center flex-shrink-0" style={{ marginTop: '-45px' }}>
        <div
          className="rounded-circle border border-4 border-white shadow-sm d-flex align-items-center justify-content-center text-white fw-bold fs-4"
          style={{
            width: '90px',
            height: '90px',
            background: 'linear-gradient(135deg, #1d39c4 0%, #2f54eb 100%)',
          }}
        >
          {initials}
        </div>
      </div>

      {/* Card Body */}
      <Card.Body className="p-4 d-flex flex-column flex-grow-1">
        <h5 className="fw-bold text-dark mb-1">{name}</h5>
        <div className="mb-2">
          <Tag color="blue">{degree}</Tag>
        </div>
        <span className="text-primary fw-semibold small mb-2 d-block">{role}</span>
        <p className="text-secondary small flex-grow-1 mb-0 line-clamp-3">{bio}</p>
      </Card.Body>
    </Card>
  );
};

export default InstructorCardItem;
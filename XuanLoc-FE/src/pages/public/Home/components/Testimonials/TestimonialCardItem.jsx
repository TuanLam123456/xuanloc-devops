import { Card } from 'react-bootstrap';
import { Tag, Rate } from 'antd';
import { getInitials } from '@/common/utils/getInitials.js';

const TestimonialCardItem = ({ name, courseTarget, achievement, comment, color = '#1677ff' }) => {
  const initials = getInitials(name, 'HV');

  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 p-4 d-flex flex-column">
      {/* Header Info */}
      <div className="d-flex justify-content-between align-items-start mb-3 flex-shrink-0">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
            style={{
              width: '46px',
              height: '46px',
              backgroundColor: color,
              fontSize: '15px',
            }}
          >
            {initials}
          </div>
          <div>
            <h6 className="fw-bold text-dark mb-0">{name}</h6>
            <small className="text-muted">{courseTarget}</small>
          </div>
        </div>
        <Tag color="success" className="fw-bold m-0">
          {achievement}
        </Tag>
      </div>

      <Rate disabled defaultValue={5} className="fs-6 mb-3 text-warning flex-shrink-0" />
      
      {/* Nội dung nhận xét */}
      <p className="text-secondary small fst-italic mb-0 flex-grow-1" style={{ minHeight: '4.5rem' }}>
        &ldquo;{comment}&rdquo;
      </p>
    </Card>
  );
};

export default TestimonialCardItem;
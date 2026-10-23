import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ navItems }) => {
  const location = useLocation();

  return (
    <Nav className="flex-column flex-shrink-0 border-end bg-white py-3 px-2" style={{ width: '240px' }}>
      {navItems.map((item) => (
        <Nav.Link
          key={item.path}
          as={Link}
          to={item.path}
          className={`px-3 py-2 mb-1 rounded-2 fw-medium d-flex align-items-center gap-2 ${
            location.pathname === item.path ? 'text-primary bg-primary-subtle' : 'text-secondary'
          }`}
        >
          {item.icon && <i className={`bi ${item.icon}`} aria-hidden="true"></i>}
          {item.label}
        </Nav.Link>
      ))}
    </Nav>
  );
};

export default Sidebar;

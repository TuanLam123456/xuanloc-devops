import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingScreen from '@/common/components/LoadingScreen/LoadingScreen.jsx';
import { ROLE_HOME_PATHS } from '@/common/constants/roles.js';

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_PATHS[user.role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

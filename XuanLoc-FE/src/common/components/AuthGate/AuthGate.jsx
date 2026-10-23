import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMe } from '@/redux/slices/authSlice.jsx';

// Dò phiên đăng nhập 1 lần khi app khởi động. Không chặn render - trang công khai không cần
// chờ kết quả này, chỉ ProtectedRoute/LoginPage mới cần đợi cờ `initialized` trong auth slice.
const AuthGate = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return children;
};

export default AuthGate;

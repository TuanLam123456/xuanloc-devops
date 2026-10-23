import { useNavigate, useLocation } from 'react-router-dom';

export const CONSULTATION_SECTION_ID = 'consultation-section';

// Cuộn tới form tư vấn nếu đang ở trang chủ; nếu đang ở trang khác thì điều hướng
// về trang chủ trước rồi cuộn (HomePage.jsx đọc location.state.scrollTo để xử lý phần này).
export const useScrollToConsultation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (location.pathname === '/') {
      document.getElementById(CONSULTATION_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: CONSULTATION_SECTION_ID } });
    }
  };
};

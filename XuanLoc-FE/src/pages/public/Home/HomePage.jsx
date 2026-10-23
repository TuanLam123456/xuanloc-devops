import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroBanner from './components/HeroBanner/HeroBanner.jsx';
import StatsCounter from './components/StatsCounter/StatsCounter.jsx';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs.jsx';
import FeaturedCourses from './components/FeaturedCourses/FeaturedCourses.jsx';
import UpcomingClasses from './components/UpcomingClasses/UpcomingClasses.jsx';
import Instructors from './components/Instructors/Instructors.jsx';
import AdmissionProcess from './components/AdmissionProcess/AdmissionProcess.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';
import ConsultationForm from './components/ConsultationForm/ConsultationForm.jsx';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Xử lý cuộn tới form tư vấn khi được điều hướng từ trang khác (useScrollToConsultation)
  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      // Xóa state để reload trang không tự cuộn lại
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-page">
      <HeroBanner />
      <StatsCounter />
      <WhyChooseUs />
      <FeaturedCourses />
      <UpcomingClasses />
      <Instructors />
      <AdmissionProcess />
      <Testimonials />
      <ConsultationForm />
    </div>
  );
};

export default HomePage;
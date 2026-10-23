import { Outlet } from 'react-router-dom';
import PublicNavbar from '../common/components/navbar/Public/PublicNavbar.jsx';
import Footer from '../common/components/Footer/Footer.jsx';


const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
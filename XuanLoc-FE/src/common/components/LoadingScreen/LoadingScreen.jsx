import { Spin } from 'antd';

const LoadingScreen = () => {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  );
};

export default LoadingScreen;

import { useInView } from 'react-intersection-observer';

const AnimateOnScroll = ({
  children,
  animation = 'animate__fadeInUp',
  delay = '0s',
  duration = '0.8s',
  className = '',
  style = {},
  threshold = 0.15,
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
  });

  return (
    <div
      ref={ref}
      className={`${className} ${inView ? `animate__animated ${animation}` : ''}`}
      style={{
        ...style,
        animationDelay: inView ? delay : undefined,
        animationDuration: inView ? duration : undefined,
        visibility: inView ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
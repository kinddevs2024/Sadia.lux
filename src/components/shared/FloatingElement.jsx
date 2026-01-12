import { motion } from 'framer-motion';

const FloatingElement = ({ children, className = '', intensity = 10, duration = 3 }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -intensity, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;



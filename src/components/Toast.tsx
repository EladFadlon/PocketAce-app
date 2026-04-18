import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/toast.css';

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };

  return (
    <motion.div
      className="toast"
      variants={variants}
      initial="initial"
      animate={isVisible ? 'animate' : 'exit'}
      transition={{ duration: 0.3 }}
    >
      {message}
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeGiftModalProps {
  onClose: () => void;
  data?: { credits?: number };
}

const WelcomeGiftModal: React.FC<WelcomeGiftModalProps> = ({ onClose, data }) => {
  const credits = data?.credits ?? 50;

  return (
    <motion.div
      className="modal-content welcome-gift-modal"
      initial={{ scale: 0.5, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.5, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button className="modal-close" onClick={onClose} whileTap={{ scale: 0.9 }}>
        ✕
      </motion.button>

      <motion.div
        className="gift-icon"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        🎁
      </motion.div>

      <h2 className="modal-title">ברוך הבא ל-Pocket Ace!</h2>

      <motion.div
        className="gift-message"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="big-text">+{credits} קרדיטים</div>
        <div className="sub-text">מתנת פתיחה בשבילך 🎰</div>
      </motion.div>

      <motion.p
        className="gift-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        התחל לשחק עם {credits} קרדיטים שמחכים לך. כל משחק עולה קרדיט אחד. בהצלחה!
      </motion.p>

      <motion.button
        className="modal-btn primary"
        onClick={onClose}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        בוא נשחק! 🎰
      </motion.button>
    </motion.div>
  );
};

export default WelcomeGiftModal;

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
      className="modal-card"
      initial={{ scale: 0.85, y: 24 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.85, y: 24 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      onClick={e => e.stopPropagation()}
    >
      <button className="modal-close" onClick={onClose}>✕</button>
      <div className="modal-icon">🎁</div>
      <h2 className="modal-title">מתנת ברוכים הבאים!</h2>
      <p className="modal-body">
        קיבלת <strong style={{ color: 'var(--yellow)' }}>+{credits} קרדיטים</strong> מתנת פתיחה! כל משחק עולה קרדיט אחד. בהצלחה! 🎰
      </p>
      <button className="modal-cta" onClick={onClose}>אחלה! נתחיל 🤙</button>
    </motion.div>
  );
};

export default WelcomeGiftModal;

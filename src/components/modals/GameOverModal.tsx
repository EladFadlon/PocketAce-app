import React from 'react';
import { motion } from 'framer-motion';

interface GameOverModalProps {
  onClose: () => void;
  data?: { onShop?: () => void };
}

const GameOverModal: React.FC<GameOverModalProps> = ({ onClose, data }) => {
  const onShop = data?.onShop ?? onClose;

  return (
    <motion.div
      className="modal-content game-over-modal"
      initial={{ scale: 0.5, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.5, y: 30 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button className="modal-close" onClick={onClose} whileTap={{ scale: 0.9 }}>
        ✕
      </motion.button>

      <motion.div
        className="game-over-icon"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        😰
      </motion.div>

      <motion.h2
        className="modal-title critical"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        נגמרו הקרדיטים!
      </motion.h2>

      <motion.div
        className="game-over-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="main-text">לא ניתן לפתוח שולחן חדש ללא קרדיטים.</p>
        <p className="sub-text">רכוש חבילה עכשיו במחירים משתלמים 🎰</p>
      </motion.div>

      <motion.div
        className="urgency-banner"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>⏰ חובה: לא ניתן לשחק ללא קרדיטים!</p>
      </motion.div>

      <motion.div
        className="modal-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          className="modal-btn secondary"
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          חזור הביתה
        </motion.button>
        <motion.button
          className="modal-btn primary"
          onClick={() => { onShop(); onClose(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🛍️ רכוש קרדיטים עכשיו
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default GameOverModal;

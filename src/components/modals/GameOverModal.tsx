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
      className="modal-card"
      initial={{ scale: 0.85, y: 24 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.85, y: 24 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      onClick={e => e.stopPropagation()}
    >
      <button className="modal-close" onClick={onClose}>✕</button>
      <div className="modal-icon">😅</div>
      <h2 className="modal-title">נגמרו הקרדיטים!</h2>
      <p className="modal-body">כדי לפתוח שולחן חדש צריך קרדיטים. רכוש חבילה ותמשיך לשחק.</p>
      <button className="modal-cta" onClick={() => { onShop(); onClose(); }}>לחנות 🛒</button>
      <button className="modal-secondary-btn" onClick={onClose}>ביטול</button>
    </motion.div>
  );
};

export default GameOverModal;

import React from 'react';
import { motion } from 'framer-motion';

interface CreditConfirmationModalProps {
  onClose: () => void;
  data?: {
    creditsRemaining?: number;
    onConfirm?: () => void;
  };
}

const CreditConfirmationModal: React.FC<CreditConfirmationModalProps> = ({ onClose, data }) => {
  const creditsRemaining = data?.creditsRemaining ?? 1;
  const onConfirm = data?.onConfirm ?? onClose;
  const isLastCredit = creditsRemaining === 1;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
      <div className="modal-icon">⚡</div>
      <h2 className="modal-title">פותחים שולחן?</h2>
      <p className="modal-body">
        יש לך <strong style={{ color: 'var(--yellow)' }}>{creditsRemaining} {creditsRemaining === 1 ? 'קרדיט' : 'קרדיטים'}</strong>. פתיחת שולחן תעלה <strong>1 קרדיט</strong>.{isLastCredit ? ' ⚠️ זה הקרדיט האחרון שלך!' : ''}
      </p>
      <button className="modal-cta" onClick={handleConfirm}>יאללה, מתחילים! 🃏</button>
      <button className="modal-secondary-btn" onClick={onClose}>ביטול</button>
    </motion.div>
  );
};

export default CreditConfirmationModal;

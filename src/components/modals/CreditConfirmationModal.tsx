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
      className="modal-content credit-confirmation-modal"
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button className="modal-close" onClick={onClose} whileTap={{ scale: 0.9 }}>
        ✕
      </motion.button>

      <motion.div
        className="modal-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        💳
      </motion.div>

      <h2 className="modal-title">פתיחת שולחן</h2>

      <motion.div
        className="credit-info"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="credit-label">קרדיטים זמינים:</p>
        <p className={`credit-amount ${isLastCredit ? 'critical' : 'normal'}`}>
          {creditsRemaining} {creditsRemaining === 1 ? 'קרדיט' : 'קרדיטים'}
        </p>
      </motion.div>

      <motion.div
        className="confirmation-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>פתיחת שולחן תעלה <strong>1 קרדיט</strong>.</p>
        <p className="sub-text">הקרדיט ינוכה רק כשהמשחק מתחיל.</p>
      </motion.div>

      {isLastCredit && (
        <motion.div
          className="warning-banner"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>⚠️ זהו הקרדיט האחרון שלך!</span>
        </motion.div>
      )}

      <motion.div
        className="modal-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          className="modal-btn secondary"
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ביטול
        </motion.button>
        <motion.button
          className={`modal-btn primary ${isLastCredit ? 'danger' : ''}`}
          onClick={handleConfirm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLastCredit ? '⚠️ המשך בכל זאת' : '🎰 יאללה בלגן!'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CreditConfirmationModal;

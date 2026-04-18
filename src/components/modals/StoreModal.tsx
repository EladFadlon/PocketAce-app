import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CREDIT_PACKAGES, simulatePurchase, getPurchaseSuccessMessage } from '../../utils/credits';

interface StoreModalProps {
  onClose: () => void;
  data?: {
    onPurchase?: (credits: number) => void;
  };
}

const PACKAGE_ICONS: Record<string, string> = {
  fish: '🐟',
  regular: '⭐',
  shark: '🦈',
};

const StoreModal: React.FC<StoreModalProps> = ({ onClose, data }) => {
  const onPurchase = data?.onPurchase ?? (() => {});
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handlePurchase = async (packageId: string) => {
    setSelectedPackage(packageId);
    setLoading(true);
    try {
      const credits = await simulatePurchase(packageId);
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)!;
      setSuccessMessage(getPurchaseSuccessMessage(pkg.name, credits));
      onPurchase(credits);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        setSelectedPackage(null);
        onClose();
      }, 3000);
    } catch {
      setLoading(false);
      setSelectedPackage(null);
    }
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
      {!success && <button className="modal-close" onClick={onClose} disabled={loading}>✕</button>}

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="modal-title">חנות קרדיטים ⚡</h2>
            <p className="modal-body" style={{ marginBottom: 12 }}>בחר חבילה ותמשיך לשחק עם החבר׳ה 🃏</p>
            {CREDIT_PACKAGES.map(pkg => (
              <div key={pkg.id} className={`modal-store-item${pkg.bestValue ? ' featured' : ''}`}>
                <div className="modal-store-icon">{PACKAGE_ICONS[pkg.id] ?? '🎰'}</div>
                <div style={{ flex: 1 }}>
                  <div className="modal-store-name">
                    {pkg.bestValue && <span className="modal-store-featured-tag">הכי משתלם</span>}
                    {pkg.name}
                  </div>
                  <div className="modal-store-meta">{pkg.games} משחקים • {(pkg.price / pkg.games).toFixed(0)}₪ למשחק</div>
                </div>
                <div className="modal-store-price">{pkg.price}₪</div>
                <button
                  className="modal-store-buy-btn"
                  disabled={loading}
                  onClick={() => !loading && handlePurchase(pkg.id)}
                >
                  {selectedPackage === pkg.id && loading ? '⏳' : 'רכוש'}
                </button>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-icon">✅</div>
            <h2 className="modal-title">רכישה הצליחה! 🎉</h2>
            <p className="modal-body">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoreModal;

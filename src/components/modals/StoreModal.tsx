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
      className="modal-content store-modal"
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      {!success && (
        <motion.button
          className="modal-close"
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          disabled={loading}
        >
          ✕
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="store-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="store-icon" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              🏪
            </motion.div>

            <h2 className="modal-title">חנות קרדיטים</h2>
            <p className="store-subtitle">בחר חבילה ותמשיך לשחק 🎮</p>

            <motion.div
              className="packages-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {CREDIT_PACKAGES.map((pkg, idx) => (
                <motion.div
                  key={pkg.id}
                  className={`package-card ${pkg.bestValue ? 'best-value' : ''} ${selectedPackage === pkg.id && loading ? 'purchasing' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  whileHover={!loading ? { scale: 1.05 } : {}}
                  onClick={() => !loading && handlePurchase(pkg.id)}
                >
                  {pkg.bestValue && (
                    <div className="best-value-badge">🔥 הכי משתלם 🔥</div>
                  )}
                  {selectedPackage === pkg.id && loading ? (
                    <div className="package-loading">
                      <div className="spinner">⚙️</div>
                      <p>מעבד...</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="package-name">{PACKAGE_ICONS[pkg.id] ?? '🎰'} {pkg.name}</h3>
                      <p className="package-games">{pkg.games} משחקים</p>
                      <p className="package-price">{pkg.price}₪</p>
                      <p className="per-game-price">{(pkg.price / pkg.games).toFixed(0)}₪ למשחק</p>
                      <button className="buy-btn">רכוש עכשיו</button>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <p className="store-footer">💳 תשלום מאובטח</p>
          </motion.div>
        ) : (
          <motion.div
            key="success-content"
            className="success-content"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="success-icon"
              animate={{ scale: [1, 1.1, 0.95, 1] }}
              transition={{ duration: 0.6 }}
            >
              ✅
            </motion.div>
            <h2 className="success-title">רכישה הצליחה! 🎉</h2>
            <p className="success-message">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoreModal;

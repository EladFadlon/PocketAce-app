import React, { useState, useCallback, useEffect } from 'react';
import WelcomeGiftModal from './WelcomeGiftModal';
import CreditConfirmationModal from './CreditConfirmationModal';
import StoreModal from './StoreModal';
import GameOverModal from './GameOverModal';
import './modals.css';

export interface ModalState {
  type: 'welcomeGift' | 'creditConfirmation' | 'store' | 'gameOver' | null;
  data?: any;
}

let showModalCallback: ((state: ModalState) => void) | null = null;

export const showModal = (state: ModalState) => {
  if (showModalCallback) {
    showModalCallback(state);
  }
};

const ModalManager: React.FC = () => {
  const [currentModal, setCurrentModal] = useState<ModalState>({ type: null });

  // Expose setCurrentModal globally for external control
  useEffect(() => {
    showModalCallback = (state) => setCurrentModal(state);
    return () => {
      showModalCallback = null;
    };
  }, []);

  const closeModal = useCallback(() => {
    setCurrentModal({ type: null });
  }, []);

  if (!currentModal.type) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    }}>
      {currentModal.type === 'welcomeGift' && (
        <WelcomeGiftModal onClose={closeModal} data={currentModal.data} />
      )}
      {currentModal.type === 'creditConfirmation' && (
        <CreditConfirmationModal onClose={closeModal} data={currentModal.data} />
      )}
      {currentModal.type === 'store' && (
        <StoreModal onClose={closeModal} data={currentModal.data} />
      )}
      {currentModal.type === 'gameOver' && (
        <GameOverModal onClose={closeModal} data={currentModal.data} />
      )}
    </div>
  );
};

export default ModalManager;

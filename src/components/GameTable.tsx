import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, ArrowLeft } from 'lucide-react';
import type { Player, GameSettings } from '../types';
import { Toast } from './Toast';
import '../styles/table.css';

interface GameTableProps {
  players: Player[];
  settings: GameSettings;
  onAddBuyIn: (playerId: string) => void;
  onEndGame: () => void;
  onQuit: () => void;
  onHome: () => void;
}

export const GameTable: React.FC<GameTableProps> = ({
  players,
  settings,
  onAddBuyIn,
  onEndGame,
  onQuit,
  onHome
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddBuyIn = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setToastMessage(`✓ Buy-in הוסף ל${player.name}!`);
    }
    onAddBuyIn(playerId);
    // Visual feedback
    setSelectedPlayer(playerId);
    setTimeout(() => setSelectedPlayer(null), 300);
  };

  const totalChips = players.reduce((sum, p) => sum + (p.buyIns * settings.chipsPerBuyIn), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const playerCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className="game-table-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="table-header">
        <motion.button 
          className="btn-back-home" 
          onClick={onHome}
          whileTap={{ scale: 0.9 }}
          title="חזור לבית"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <div className="header-info">
          <h1>🎰 Pocket Ace</h1>
          <p className="game-stats">
            👥 {players.length} שחקנים | 🎯 {totalChips} ז'יטונים | 💰 {players.length * settings.nisPerBuyIn}₪ בפוט
          </p>
        </div>
        <div className="header-actions">
          <motion.button className="btn-end-game" onClick={onEndGame} whileTap={{ scale: 0.95 }}>
            סוגרים באסטה
          </motion.button>
          <motion.button className="btn-quit" onClick={onQuit} whileTap={{ scale: 0.95 }}>
            <LogOut size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Players Grid */}
      <motion.div className="players-grid" layout>
        <AnimatePresence>
          {players.map(player => (
            <motion.div
              key={player.id}
              className={`player-card ${selectedPlayer === player.id ? 'active' : ''}`}
              variants={playerCardVariants}
              layout
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Player Header */}
              <div className="card-header">
                <h3 className="player-name">{player.name}</h3>
              </div>

              {/* Card Content */}
              <div className="card-content">
                <motion.div className="stat">
                  <span className="label">כניסות</span>
                  <span className="value">{player.buyIns}</span>
                </motion.div>

                <motion.div className="stat">
                  <span className="label">ז'יטונים</span>
                  <span className="value">{player.buyIns * settings.chipsPerBuyIn}</span>
                </motion.div>

                <motion.div className="stat highlight">
                  <span className="label">סה"כ השקעה</span>
                  <span className="value-nis">{player.buyIns * settings.nisPerBuyIn}₪</span>
                </motion.div>
              </div>

              {/* Add Buy-In Button */}
              <motion.button
                className="btn-add-buyin"
                onClick={() => handleAddBuyIn(player.id)}
                title="עוד כניסה, בלי לבכות"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                <Plus size={32} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Info Footer */}
      <motion.div className="table-footer">
        <p>💡 עוד כניסה, בלי לבכות או "סוגרים באסטה" לסיום</p>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

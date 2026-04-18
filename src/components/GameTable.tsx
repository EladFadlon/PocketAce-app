import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', cardBg: 'linear-gradient(145deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05))', border: 'rgba(231,76,60,0.35)', glow: 'rgba(231,76,60,0.45)', text: '#e74c3c', dotActive: '#e74c3c', dotGlow: 'rgba(231,76,60,0.8)', badgeBg: 'rgba(231,76,60,0.15)', badgeText: 'rgba(231,76,60,0.8)', btnShadow: 'rgba(231,76,60,0.35)' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', cardBg: 'linear-gradient(145deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05))',  border: 'rgba(52,152,219,0.35)',  glow: 'rgba(52,152,219,0.45)',  text: '#3498db', dotActive: '#3498db', dotGlow: 'rgba(52,152,219,0.8)',  badgeBg: 'rgba(52,152,219,0.15)',  badgeText: 'rgba(52,152,219,0.8)',  btnShadow: 'rgba(52,152,219,0.35)'  },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', cardBg: 'linear-gradient(145deg,rgba(46,204,113,0.15),rgba(46,204,113,0.05))',  border: 'rgba(46,204,113,0.35)',  glow: 'rgba(46,204,113,0.45)',  text: '#2ecc71', dotActive: '#2ecc71', dotGlow: 'rgba(46,204,113,0.8)',  badgeBg: 'rgba(46,204,113,0.15)',  badgeText: 'rgba(46,204,113,0.8)',  btnShadow: 'rgba(46,204,113,0.35)'  },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', cardBg: 'linear-gradient(145deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05))',  border: 'rgba(155,89,182,0.35)',  glow: 'rgba(155,89,182,0.45)',  text: '#9b59b6', dotActive: '#9b59b6', dotGlow: 'rgba(155,89,182,0.8)',  badgeBg: 'rgba(155,89,182,0.15)',  badgeText: 'rgba(155,89,182,0.8)',  btnShadow: 'rgba(155,89,182,0.35)'  },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', cardBg: 'linear-gradient(145deg,rgba(255,107,53,0.15),rgba(255,107,53,0.05))',  border: 'rgba(255,107,53,0.35)',  glow: 'rgba(255,107,53,0.45)',  text: '#ff6b35', dotActive: '#ff6b35', dotGlow: 'rgba(255,107,53,0.8)',  badgeBg: 'rgba(255,107,53,0.15)',  badgeText: 'rgba(255,107,53,0.8)',  btnShadow: 'rgba(255,107,53,0.35)'  },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', cardBg: 'linear-gradient(145deg,rgba(243,156,18,0.15),rgba(243,156,18,0.05))',  border: 'rgba(243,156,18,0.35)',  glow: 'rgba(243,156,18,0.45)',  text: '#f39c12', dotActive: '#f39c12', dotGlow: 'rgba(243,156,18,0.8)',  badgeBg: 'rgba(243,156,18,0.15)',  badgeText: 'rgba(243,156,18,0.8)',  btnShadow: 'rgba(243,156,18,0.35)'  },
];
const MAX_DOTS = 4;
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];
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
  onAddBuyIn,
  onEndGame,
  onQuit,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddBuyIn = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setToastMessage(`✓ Buy-in הוסף ל${player.name}!`);
    }
    onAddBuyIn(playerId);
  };

  const playerCardVariants = {
    tap: { scale: 0.98 }
  };

  return (
    <div className="game-table-screen">
      <div className="table-header">
        <div className="table-header-left">
          <div className="table-header-label">שולחן פעיל</div>
          <div className="table-header-pot">
            {players.reduce((sum, p) => sum + p.totalInvested, 0)}{' '}
            <small>₪ בקופה</small>
          </div>
        </div>
        <div className="table-player-count">
          <span>⚡</span>
          <span>{players.length} שחקנים</span>
        </div>
      </div>

      <div className="table-grid">
        {players.map((player, index) => {
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
          const isOnFire = player.buyIns >= 3;
          const emoji = PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
          const dots = Array.from({ length: Math.min(MAX_DOTS, Math.max(player.buyIns, 1)) });

          return (
            <motion.div
              key={player.id}
              className="player-card"
              style={{ background: color.cardBg, border: `1px solid ${color.border}` }}
              variants={playerCardVariants}
              whileTap="tap"
            >
              <div
                className="player-card-badge"
                style={{ background: isOnFire ? 'rgba(255,107,53,0.2)' : color.badgeBg, color: isOnFire ? '#ff6b35' : color.badgeText }}
              >
                ×{player.buyIns}{isOnFire ? ' 🔥' : ''}
              </div>
              {player.isHost && <div className="player-card-host-badge">👑</div>}

              <div
                className="player-avatar"
                style={{ background: color.bg, boxShadow: `0 4px 16px ${color.glow}` }}
              >{emoji}</div>

              <div className="player-name">{player.name}</div>

              <div className="player-dots">
                {dots.map((_, i) => (
                  <div
                    key={i}
                    className="player-dot"
                    style={i < player.buyIns
                      ? { background: color.dotActive, boxShadow: `0 0 6px ${color.dotGlow}`, border: 'none' }
                      : {}}
                  />
                ))}
              </div>

              <div className="player-amount" style={{ color: color.text }}>
                {player.totalInvested}₪
              </div>

              <motion.button
                className="player-buyin-btn"
                style={{ background: color.bg, boxShadow: `0 4px 12px ${color.btnShadow}` }}
                onClick={() => handleAddBuyIn(player.id)}
                whileTap={{ scale: 0.96 }}
              >+ Buy In</motion.button>
            </motion.div>
          );
        })}

        <div className="table-add-slot">
          <div className="table-add-slot-icon">+</div>
          <div className="table-add-slot-label">הוסף שחקן</div>
        </div>
      </div>

      <div className="table-bottom">
        <button className="table-quit-btn" onClick={onQuit}>🚪 יציאה</button>
        <motion.button className="table-end-btn" onClick={onEndGame} whileTap={{ scale: 0.97 }}>
          🏁 סיים משחק
        </motion.button>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

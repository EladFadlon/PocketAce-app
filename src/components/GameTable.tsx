import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, GameSettings } from '../types';
import { Toast } from './Toast';
import '../styles/table.css';

const CHIP_PALETTES = [
  ['#C44B30','#E05A3A','#A03820','#D4624A','#8A2810'],
  ['#2A5C38','#3A7A4C','#1E4428','#4A9060','#163220'],
  ['#1A3A8A','#2A4EAA','#122A6A','#3A62C0','#0E1E50'],
  ['#7A3A8A','#9A4EAA','#5A2868','#B060C0','#401C50'],
  ['#B87A10','#D49020','#8A5A08','#E0A830','#604004'],
  ['#2A7A8A','#3A9AAA','#1C5A68','#4AB0C0','#123840'],
];

const jitter = (playerIdx: number, i: number, range: number) => {
  const seed = (playerIdx * 7 + i * 13) % 17;
  return (seed / 17 - 0.5) * range;
};

const ChipStack: React.FC<{ count: number; playerIdx: number }> = ({ count, playerIdx }) => {
  const palette = CHIP_PALETTES[playerIdx % CHIP_PALETTES.length];
  const chips = Array.from({ length: Math.min(count, 6) });
  const size = 30;
  const totalH = size + chips.length * 5 + 8;
  return (
    <div style={{ position: 'relative', width: size + 10, height: totalH, flexShrink: 0, alignSelf: 'flex-end' }}>
      {chips.map((_, i) => {
        const dx = jitter(playerIdx, i, 3);
        const dy = jitter(playerIdx, i + 5, 1);
        const rot = jitter(playerIdx, i + 11, 4);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: i * 5 + dy,
              left: 5 + dx,
              width: size, height: size,
              borderRadius: '50%',
              background: palette[i % palette.length],
              border: '1.5px solid rgba(255,255,255,0.12)',
              boxShadow: `${dx * 0.3}px 2px 5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`,
              transform: `rotate(${rot}deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {i === chips.length - 1 && (
              <span style={{ fontFamily: 'serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', transform: `rotate(${-rot}deg)` }}>♠</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
};

interface GameTableProps {
  players: Player[];
  settings: GameSettings;
  onAddBuyIn: (playerId: string) => void;
  onEndGame: () => void;
  onQuit: () => void;
  onHome: () => void;
}

export const GameTable: React.FC<GameTableProps> = ({ players, onAddBuyIn, onEndGame, onQuit }) => {
  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleAddBuyIn = (player: Player) => {
    setToastMessage(`✓ Buy-in הוסף ל${player.name}!`);
    onAddBuyIn(player.id);
  };

  const totalPot = players.reduce((s, p) => s + p.totalInvested, 0);

  return (
    <div className="game-table-screen">
      {/* Header — clock + pot */}
      <div className="table-header">
        <div className="table-clock-block">
          <div className="table-header-label">זמן משחק</div>
          <div className="table-clock">{fmtTime(elapsed)}</div>
        </div>
        <div className="table-pot-block">
          <div className="table-header-label">על השולחן</div>
          <div className="table-pot">₪{totalPot.toLocaleString('he-IL')}</div>
        </div>
      </div>

      {/* Player list */}
      <div className="table-list">
        {players.map((player, i) => (
          <motion.div
            key={player.id}
            className="table-player-row surface"
            style={{ borderRight: `3px solid ${i === 0 ? '#C49A2C' : 'var(--sage)'}` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <ChipStack count={player.buyIns} playerIdx={i} />
            <div className="table-player-info">
              <div
                className="table-player-name"
                style={{ color: i === 0 ? '#C49A2C' : 'var(--paper)' }}
              >{player.name}</div>
              <div className="table-player-sub">×{player.buyIns} קנייה</div>
            </div>
            <div className="table-player-balance">₪{player.totalInvested.toLocaleString('he-IL')}</div>
            <button className="table-buyin-btn" onClick={() => handleAddBuyIn(player)}>+ קנייה</button>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="table-footer">
        <button className="table-quit-btn" onClick={onQuit}>יציאה</button>
        <button className="table-end-btn" onClick={() => setShowConfirm(true)}>סגור שולחן</button>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="table-confirm-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="table-confirm-card surface"
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="table-confirm-title">לסגור את השולחן?</div>
              <div className="table-confirm-sub">תועברו לספירת הצ׳יפים</div>
              <div className="table-confirm-actions">
                <button className="table-confirm-continue" onClick={() => setShowConfirm(false)}>המשך</button>
                <button className="table-confirm-close" onClick={onEndGame}>סגור</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

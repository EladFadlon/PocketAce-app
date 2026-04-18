import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { Player, GameSettings } from '../types';
import '../styles/endgame.css';

interface EndGameProps {
  players: Player[];
  settings: GameSettings;
  onCalculate: (finalChips: Record<string, number>) => void;
  onBack: () => void;
  onHome: () => void;
}

export const EndGame: React.FC<EndGameProps> = ({
  players,
  settings,
  onCalculate,
  onBack,
  onHome
}) => {
  const [finalChips, setFinalChips] = useState<Record<string, number>>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: p.buyIns * settings.chipsPerBuyIn }), {})
  );

  // Calculate total chips purchased during the game
  const totalBoughtChips = players.reduce((sum, p) => sum + (p.buyIns * settings.chipsPerBuyIn), 0);
  
  const allFilled = players.every(p => typeof finalChips[p.id] === 'number');
  const totalChips = Object.values(finalChips).reduce((a, b) => a + b, 0);
  const expectedChips = totalBoughtChips;  // MUST equal total purchased chips
  
  // Chip validation: must match exactly
  const chipsBalance = totalChips - expectedChips;
  const chipsMatch = Math.abs(chipsBalance) < 0.01;
  const missingChips = Math.max(0, expectedChips - totalChips);

  const handleCalculate = () => {
    onCalculate(finalChips);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="endgame-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Back Button */}
      <motion.div className="endgame-header-with-back" variants={itemVariants}>
        <motion.button 
          className="btn-back-home" 
          onClick={onHome}
          whileTap={{ scale: 0.9 }}
          title="חזור לבית"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <div>
          <h1>שבור את הכלים</h1>
          <p className="subtitle">הכנס את הספירה הסופית של הז׳יטונים של כל שחקן</p>
        </div>
        <div style={{ width: '48px' }} />
      </motion.div>

      {/* Players Input Grid */}
      <motion.div className="players-input-grid" layout>
        {players.map(player => (
          <motion.div
            key={player.id}
            className="player-input-card"
            variants={itemVariants}
            layout
          >
            <label className="player-label">{player.name}</label>
            <div className="chip-counter">
              <button
                onClick={() => {
                  const current = finalChips[player.id] || 0;
                  setFinalChips({
                    ...finalChips,
                    [player.id]: Math.max(0, current - settings.chipsPerBuyIn)
                  });
                }}
              >
                −
              </button>
              <input
                type="number"
                value={finalChips[player.id] || ''}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setFinalChips({
                    ...finalChips,
                    [player.id]: isNaN(val) ? 0 : Math.max(0, val)
                  });
                }}
                className="chip-input"
              />
              <button
                onClick={() => {
                  const current = finalChips[player.id] || 0;
                  setFinalChips({
                    ...finalChips,
                    [player.id]: current + settings.chipsPerBuyIn
                  });
                }}
              >
                +
              </button>
            </div>
            <p className="chip-info">{finalChips[player.id] || 0} ז'יטונים</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Chip Total Check */}
      <motion.div
        className={`chip-total ${chipsMatch ? 'valid' : 'warning'}`}
        variants={itemVariants}
      >
        <p>
          <span className="label">סה"כ ז'יטונים:</span>
          <span className="total">{totalChips}</span>
          <span className="expected">/ {expectedChips}</span>
        </p>
        {!chipsMatch && (
          <div className="warning-details">
            <p className="warning-text">⚠️ חובה לאזן את השולחן כדי להמשיך</p>
            <p className="warning-subtext">חסרים {missingChips} ז'יטונים</p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div className="action-buttons" variants={itemVariants}>
        <motion.button className="btn-back" onClick={onBack} whileTap={{ scale: 0.95 }}>
          ← חזור
        </motion.button>
        <motion.button
          className="btn-calculate"
          onClick={handleCalculate}
          disabled={!allFilled || !chipsMatch}
          whileTap={{ scale: 0.95 }}
          title={!chipsMatch ? "חייבים לתאום את סכום הזיטונים" : ""}
        >
          תקפלו תחבילה
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

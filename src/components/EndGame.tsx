import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', cardBg: 'linear-gradient(145deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05))', border: 'rgba(231,76,60,0.35)', glow: 'rgba(231,76,60,0.45)', text: '#e74c3c' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', cardBg: 'linear-gradient(145deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05))',  border: 'rgba(52,152,219,0.35)',  glow: 'rgba(52,152,219,0.45)',  text: '#3498db' },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', cardBg: 'linear-gradient(145deg,rgba(46,204,113,0.15),rgba(46,204,113,0.05))',  border: 'rgba(46,204,113,0.35)',  glow: 'rgba(46,204,113,0.45)',  text: '#2ecc71' },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', cardBg: 'linear-gradient(145deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05))',  border: 'rgba(155,89,182,0.35)',  glow: 'rgba(155,89,182,0.45)',  text: '#9b59b6' },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', cardBg: 'linear-gradient(145deg,rgba(255,107,53,0.15),rgba(255,107,53,0.05))',  border: 'rgba(255,107,53,0.35)',  glow: 'rgba(255,107,53,0.45)',  text: '#ff6b35' },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', cardBg: 'linear-gradient(145deg,rgba(243,156,18,0.15),rgba(243,156,18,0.05))',  border: 'rgba(243,156,18,0.35)',  glow: 'rgba(243,156,18,0.45)',  text: '#f39c12' },
];
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];
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
}) => {
  const [finalChips, setFinalChips] = useState<Record<string, number>>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: p.buyIns * settings.chipsPerBuyIn }), {})
  );
  const [rawChips, setRawChips] = useState<Record<string, string>>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: String(p.buyIns * settings.chipsPerBuyIn) }), {})
  );

  const handleChipChange = (playerId: string, value: number) => {
    const clamped = Math.max(0, value);
    setFinalChips({ ...finalChips, [playerId]: clamped });
    setRawChips({ ...rawChips, [playerId]: String(clamped) });
  };

  const handleCalculate = () => {
    onCalculate(finalChips);
  };

  const totalZhetons = players.reduce((sum, p) => sum + (p.buyIns * settings.chipsPerBuyIn), 0);
  const currentTotal = Object.values(finalChips).reduce((sum, v) => sum + (v || 0), 0);
  const isValid = currentTotal === totalZhetons;

  return (
    <div className="endgame-screen">
      <div className="endgame-header">
        <h1 className="endgame-title">כמה ז׳יטונים יש לך? 🏁</h1>
        <button className="endgame-back" onClick={onBack}>← חזור</button>
      </div>

      <div className="endgame-total-pill">
        <span className="endgame-total-label">סה&quot;כ ז׳יטונים בשולחן</span>
        <span className="endgame-total-value">{totalZhetons} ז׳יטונים</span>
      </div>

      <div className="endgame-body">
        {players.map((player, index) => {
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
          const emoji = PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
          const value = finalChips[player.id] ?? 0;

          return (
            <div
              key={player.id}
              className="endgame-player-row"
              style={{ background: color.cardBg, border: `1px solid ${color.border}` }}
            >
              <div
                className="endgame-player-avatar"
                style={{ background: color.bg, boxShadow: `0 4px 12px ${color.glow}` }}
              >{emoji}</div>
              <div className="endgame-player-info">
                <div className="endgame-player-name">{player.name}</div>
                <div className="endgame-player-invested">השקיע: {player.buyIns * settings.nisPerBuyIn}₪ (×{player.buyIns})</div>
              </div>
              <div
                className="endgame-stepper"
                style={{ border: `1px solid ${color.border}` }}
              >
                <button
                  className="endgame-stepper-btn"
                  style={{ color: `${color.text}60` }}
                  onClick={() => handleChipChange(player.id, Math.max(0, value - settings.chipsPerBuyIn))}
                >−</button>
                <input
                  className="endgame-stepper-value"
                  type="number"
                  inputMode="numeric"
                  value={rawChips[player.id] ?? ''}
                  onChange={e => {
                    setRawChips({ ...rawChips, [player.id]: e.target.value });
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0) setFinalChips({ ...finalChips, [player.id]: v });
                  }}
                  onBlur={() => {
                    const v = Math.max(0, parseInt(rawChips[player.id], 10) || 0);
                    handleChipChange(player.id, v);
                  }}
                  onFocus={e => e.target.select()}
                />
                <button
                  className="endgame-stepper-btn"
                  style={{ color: color.text }}
                  onClick={() => handleChipChange(player.id, value + settings.chipsPerBuyIn)}
                >+</button>
              </div>
            </div>
          );
        })}

        <div className={`endgame-validation ${isValid ? 'valid' : 'invalid'}`}>
          <span className="endgame-validation-label">סה&quot;כ הוזן</span>
          <span className={`endgame-validation-value ${isValid ? 'valid' : 'invalid'}`}>
            {currentTotal} {isValid ? '✅ מדויק!' : `/ ${totalZhetons}`}
          </span>
        </div>
      </div>

      <div className="endgame-footer">
        <motion.button
          className="endgame-cta"
          onClick={handleCalculate}
          disabled={!isValid}
          whileTap={{ scale: 0.97 }}
        >חשב מי חייב למי 🧮</motion.button>
      </div>
    </div>
  );
};

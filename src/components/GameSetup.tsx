import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PLAYER_COLORS = [
  'linear-gradient(135deg,#e74c3c,#c0392b)',
  'linear-gradient(135deg,#3498db,#2980b9)',
  'linear-gradient(135deg,#2ecc71,#27ae60)',
  'linear-gradient(135deg,#9b59b6,#8e44ad)',
  'linear-gradient(135deg,#ff6b35,#e55a24)',
  'linear-gradient(135deg,#f39c12,#d68910)',
];
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];
import type { GameSettings, Player } from '../types';
import '../styles/setup.css';

interface GameSetupProps {
  onStartGame: (settings: GameSettings, players: Player[]) => void;
  onHome: () => void;
  existingPlayers?: Player[];
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, onHome, existingPlayers = [] }) => {
  const [nisPerBuyIn, setNisPerBuyIn] = useState(50);
  const [chipsPerBuyIn, setChipsPerBuyIn] = useState(100);
  const [nisRaw, setNisRaw] = useState('50');
  const [chipsRaw, setChipsRaw] = useState('100');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  const updateNis = (val: number) => { setNisPerBuyIn(val); setNisRaw(String(val)); };
  const updateChips = (val: number) => { setChipsPerBuyIn(val); setChipsRaw(String(val)); };

  useEffect(() => {
    // Initialize with existing players (e.g., auto-added host)
    if (existingPlayers.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayers(existingPlayers);
    }
  }, [existingPlayers]);

  const handleAddPlayer = () => {
    const trimmed = playerName.trim();
    if (trimmed && players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`שחקן בשם "${trimmed}" כבר קיים`);
      return;
    }
    if (trimmed) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: trimmed,
        buyIns: 1,
        totalInvested: nisPerBuyIn,
        finalChips: chipsPerBuyIn,
        isHost: false  // Only auto-added player is host
      };
      setPlayers([...players, newPlayer]);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (id: string) => {
    // Don't allow removing the host player
    const player = players.find(p => p.id === id);
    if (player?.isHost) {
      alert('לא ניתן להסיר את המארח');
      return;
    }
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleStart = () => {
    if (players.length >= 2) {
      const finalPlayers = players.map(p => ({
        ...p,
        totalInvested: p.buyIns * nisPerBuyIn,
        finalChips: p.buyIns * chipsPerBuyIn,
      }));
      onStartGame({ nisPerBuyIn, chipsPerBuyIn }, finalPlayers);
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1 className="setup-title">הגדרת שולחן 🃏</h1>
        <button className="setup-back" onClick={onHome}>← חזור</button>
      </div>

      <div className="setup-body">
        {/* Buy-in steppers */}
        <div>
          <div className="setup-section-label">הגדרות BUY-IN</div>
          <div className="setup-steppers">
            <div className="setup-stepper-card">
              <div className="setup-stepper-label">₪ לכל buy-in</div>
              <div className="setup-stepper-row">
                <button className="setup-stepper-btn minus" onClick={() => updateNis(Math.max(10, nisPerBuyIn - 5))}>−</button>
                <div className="setup-stepper-center">
                  <input
                    className="setup-stepper-value"
                    type="number"
                    inputMode="numeric"
                    value={nisRaw}
                    onChange={e => {
                      setNisRaw(e.target.value);
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v > 0) setNisPerBuyIn(v);
                    }}
                    onBlur={() => {
                      const v = Math.max(10, parseInt(nisRaw, 10) || 10);
                      updateNis(v);
                    }}
                    onFocus={e => e.target.select()}
                  />
                  <span className="setup-stepper-currency">₪</span>
                </div>
                <button className="setup-stepper-btn plus" onClick={() => updateNis(nisPerBuyIn + 5)}>+</button>
              </div>
            </div>
            <div className="setup-stepper-card">
              <div className="setup-stepper-label">ז׳יטונים לכל buy-in</div>
              <div className="setup-stepper-row">
                <button className="setup-stepper-btn minus" onClick={() => updateChips(Math.max(50, chipsPerBuyIn - 50))}>−</button>
                <input
                  className="setup-stepper-value"
                  type="number"
                  inputMode="numeric"
                  value={chipsRaw}
                  onChange={e => {
                    setChipsRaw(e.target.value);
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v > 0) setChipsPerBuyIn(v);
                  }}
                  onBlur={() => {
                    const v = Math.max(50, parseInt(chipsRaw, 10) || 50);
                    updateChips(v);
                  }}
                  onFocus={e => e.target.select()}
                />
                <button className="setup-stepper-btn plus" onClick={() => updateChips(chipsPerBuyIn + 50)}>+</button>
              </div>
            </div>
          </div>
          <div className="setup-rate-pill">
            1 ז׳יטון = {(nisPerBuyIn / chipsPerBuyIn).toFixed(2)}₪
          </div>
        </div>

        {/* Players */}
        <div>
          <div className="setup-section-label">שחקנים ({players.length})</div>
          <div className="setup-players">
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                className={`setup-player-row${player.isHost ? ' host' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div
                  className="setup-player-avatar"
                  style={{ background: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                >{PLAYER_EMOJIS[idx % PLAYER_EMOJIS.length]}</div>
                <div className="setup-player-name">
                  {player.isHost && <span className="setup-player-host-badge">👑 מארח</span>}
                  {player.name}
                </div>
                {!player.isHost && (
                  <button className="setup-player-remove" onClick={() => handleRemovePlayer(player.id)}>✕</button>
                )}
              </motion.div>
            ))}

            {/* Add player row */}
            <div className="setup-add-row">
              <div className="setup-add-icon">+</div>
              <input
                className="setup-add-input"
                type="text"
                placeholder="הוסף שחקן..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              />
            </div>
            {playerName.trim() && (
              <motion.button
                style={{ width: '100%', background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.25)', color: 'var(--yellow)', padding: '10px', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                onClick={handleAddPlayer}
                whileTap={{ scale: 0.97 }}
              >+ הוסף</motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="setup-footer">
        <motion.button
          className="setup-cta"
          onClick={handleStart}
          disabled={players.length < 2}
          whileTap={{ scale: 0.97 }}
        >יאללה, מתחילים! 🚀</motion.button>
      </div>
    </div>
  );
};

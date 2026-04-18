import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Play, ArrowLeft, Shield } from 'lucide-react';
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
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Initialize with existing players (e.g., auto-added host)
    if (existingPlayers.length > 0) {
      setPlayers(existingPlayers);
    }
  }, [existingPlayers]);

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: playerName.trim(),
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
      onStartGame({ nisPerBuyIn, chipsPerBuyIn }, players);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="setup-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Back Button */}
      <motion.div className="setup-header-with-back" variants={itemVariants}>
        <motion.button 
          className="btn-back-home" 
          onClick={onHome}
          whileTap={{ scale: 0.9 }}
          title="חזור לבית"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="title">♠️ Pocket Ace</h1>
        <div style={{ width: '48px' }} />
      </motion.div>

      {/* Settings */}
      <motion.div className="settings-card" variants={itemVariants}>
        <h2>⚙️ הגדרות המשחק</h2>
        <div className="settings-grid">
          <div className="setting-input">
            <label>💰 NIS לכל Buy-In</label>
            <div className="input-group">
              <button onClick={() => setNisPerBuyIn(Math.max(10, nisPerBuyIn - 5))}>−</button>
              <input
                type="number"
                value={nisPerBuyIn}
                onChange={e => setNisPerBuyIn(Math.max(10, parseInt(e.target.value) || 10))}
              />
              <button onClick={() => setNisPerBuyIn(nisPerBuyIn + 5)}>+</button>
            </div>
          </div>
          <div className="setting-input">
            <label>🎰 ז'יטונים לכל Buy-In</label>
            <div className="input-group">
              <button onClick={() => setChipsPerBuyIn(Math.max(50, chipsPerBuyIn - 50))}>−</button>
              <input
                type="number"
                value={chipsPerBuyIn}
                onChange={e => setChipsPerBuyIn(Math.max(50, parseInt(e.target.value) || 50))}
              />
              <button onClick={() => setChipsPerBuyIn(chipsPerBuyIn + 50)}>+</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Management */}
      <motion.div className="players-card" variants={itemVariants}>
        <h2>👥 שחקנים ({players.length})</h2>
        
        <div className="add-player-form">
          <input
            type="text"
            placeholder="שם השחקן..."
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddPlayer()}
            className="player-input"
          />
          <motion.button
            className="btn-add-player"
            onClick={handleAddPlayer}
            disabled={!playerName.trim()}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            הוסף
          </motion.button>
        </div>

        {players.length === 0 ? (
          <p className="no-players">עדיין לא הוספת שחקנים</p>
        ) : (
          <motion.div className="players-list" layout>
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                className="player-item"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="player-info">
                  <span className="player-number">{idx + 1}</span>
                  <span className="player-name">
                    {player.name}
                    {player.isHost && (
                      <span className="host-badge-wrapper" title="מארח">
                        <Shield size={14} className="host-badge" />
                      </span>
                    )}
                  </span>
                </div>
                <motion.button
                  className="btn-remove"
                  onClick={() => handleRemovePlayer(player.id)}
                  disabled={player.isHost}
                  whileTap={{ scale: 0.9 }}
                  title={player.isHost ? 'לא ניתן להסיר את המארח' : 'הסר שחקן'}
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Start Button */}
      <motion.button
        className="btn-start"
        onClick={handleStart}
        disabled={players.length < 2}
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
      >
        <Play size={24} />
        יאללה בלגן
      </motion.button>

      {players.length < 2 && (
        <p className="help-text">⚠️ נדרשים לפחות 2 שחקנים להתחלת המשחק</p>
      )}
    </motion.div>
  );
};

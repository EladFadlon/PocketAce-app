import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, LogOut, History } from 'lucide-react';
import type { User, GameRecord } from '../types';
import { getRecentGames, calculateCumulativeProfitLoss, getCumulativeStatus } from '../utils/gameHistory';
import { CREDIT_PACKAGES, simulatePurchase } from '../utils/credits';
import '../styles/lobby.css';

interface LobbyProps {
  onStartGame: () => void;
  user: User;
  onLogout: () => void;
  onCreditsUpdate: (additionalCredits: number) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame, user, onLogout, onCreditsUpdate }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [recentGames, setRecentGames] = useState<GameRecord[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
  const [status, setStatus] = useState({ badge: '', message: '' });
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('pocketAceVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('pocketAceVisited', 'true');
    }
    const games = getRecentGames(user.id, 3);
    setRecentGames(games);
    const cumulative = calculateCumulativeProfitLoss(user.id, user.name);
    setStatus(getCumulativeStatus(cumulative));
  }, [user.id, user.name]);

  const handleBuyPackage = async (packageId: string) => {
    if (purchasingId) return;
    setPurchasingId(packageId);
    try {
      const credits = await simulatePurchase(packageId);
      onCreditsUpdate(credits);
    } catch {
      // purchase failed — user stays on same screen
    } finally {
      setPurchasingId(null);
    }
  };

  const firstName = user.name.split(' ')[0];

  return (
    <div className="lobby-screen">
      <div className="lobby-bg" />

      {/* Header */}
      <div className="lobby-header">
        <motion.button
          className="btn-logout"
          onClick={onLogout}
          whileTap={{ scale: 0.9 }}
          title="התנתק"
        >
          <LogOut size={18} />
        </motion.button>

        <span className="lobby-greeting">שלום, {firstName} 👋</span>

        <div className="lobby-credits-pill">
          <Zap size={14} />
          <span className="credits-count">{user.credits}</span>
        </div>
      </div>

      {/* Logo */}
      <motion.div
        className="lobby-logo"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
      >
        <h1 className="logo-text">♠ Pocket Ace ♠</h1>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="lobby-cta"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <button className="btn-new-game" onClick={onStartGame}>
          <Zap size={26} />
          <span>פתיחת שולחן</span>
        </button>
      </motion.div>

      {/* Scrollable content */}
      <div className="lobby-scroll">

        {/* Cumulative status */}
        {recentGames.length > 0 && status.badge && (
          <motion.div
            className="lobby-status-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="status-badge">{status.badge}</span>
            <span className="status-msg">{status.message}</span>
          </motion.div>
        )}

        {/* Recent games history */}
        {recentGames.length > 0 && (
          <motion.div
            className="lobby-history-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="history-header">
              <History size={15} />
              <span>משחקים אחרונים</span>
            </div>
            {recentGames.map(game => (
              <motion.button
                key={game.id}
                className="history-item"
                onClick={() => setSelectedGame(game)}
                whileTap={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="history-date">
                  {new Date(game.date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
                </span>
                <div className="history-details">
                  {game.topShark && (
                    <span>🦈 {game.topShark.name}: +{game.topShark.amount.toFixed(0)}₪</span>
                  )}
                  <span className="history-debts">💰 {game.debts.length} חובות</span>
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: 16 }}>‹</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Credits store */}
        <motion.div
          className="store-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="store-section-header">
            <Zap size={16} />
            <span>חנות קרדיטים</span>
          </div>

          {CREDIT_PACKAGES.map(pkg => {
            const ICONS: Record<string, string> = { fish: '🐟', regular: '⭐', shark: '🦈' };
            const isLoading = purchasingId === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`store-item${pkg.bestValue ? ' store-item--featured' : ''}`}
              >
                <span className="store-item-icon">{ICONS[pkg.id] ?? '🎰'}</span>

                <div className="store-item-info">
                  <span className="store-item-name">
                    {pkg.name}
                    {pkg.bestValue && <span className="featured-tag">הכי משתלם</span>}
                  </span>
                  <span className="store-item-meta">
                    {pkg.games} משחקים · {(pkg.price / pkg.games).toFixed(0)}₪ למשחק
                  </span>
                </div>

                <div className="store-item-right">
                  <span className="store-item-price">{pkg.price}₪</span>
                  <motion.button
                    className="btn-buy"
                    disabled={!!purchasingId}
                    onClick={() => handleBuyPackage(pkg.id)}
                    whileTap={!purchasingId ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? '⏳' : 'רכוש'}
                  </motion.button>
                </div>
              </div>
            );
          })}
        </motion.div>

      </div>{/* end lobby-scroll */}

      {/* Game details bottom sheet */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="game-details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              className="game-details-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.button
                className="details-close-btn"
                onClick={() => setSelectedGame(null)}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>

              <h2>📊 תוצאות המשחק</h2>

              <div className="game-details-content" style={{ direction: 'rtl' }}>
                <div className="details-header">
                  <p><strong>תאריך:</strong> {new Date(selectedGame.date).toLocaleDateString('he-IL')}</p>
                  <p><strong>מארח:</strong> {selectedGame.hostsName}</p>
                  <p><strong>סכום כולל:</strong> {selectedGame.totalPot.toFixed(0)}₪</p>
                </div>

                {selectedGame.topShark && (
                  <div className="top-shark-display">
                    <h3>🦈 המנצח הגדול</h3>
                    <p className="top-shark-name">{selectedGame.topShark.name}</p>
                    <p className="top-shark-amount">+{selectedGame.topShark.amount.toFixed(0)}₪</p>
                  </div>
                )}

                {selectedGame.debts.length > 0 && (
                  <div className="debts-display">
                    <h3>💰 חובות</h3>
                    <div className="debts-list">
                      {selectedGame.debts.map((debt, idx) => (
                        <div key={idx} className="debt-item">
                          <span className="debt-from">{debt.from}</span>
                          <span className="debt-arrow">←</span>
                          <span className="debt-to">{debt.to}</span>
                          <span className="debt-amount">{debt.amount.toFixed(0)}₪</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="btn-back-to-lobby" onClick={() => setSelectedGame(null)}>
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome popup (first visit only) */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="welcome-popup"
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 24 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <motion.button
                className="close-btn"
                onClick={() => setShowWelcome(false)}
                whileTap={{ scale: 0.9 }}
              >
                <X size={22} />
              </motion.button>
              <h2>ברוכים הבאים ל-Pocket Ace ♠</h2>
              <p>כל משחק עולה קרדיט אחד. הקרדיט ינוכה רק כשהמשחק מתחיל. 💎</p>
              <motion.button
                className="welcome-confirm"
                onClick={() => setShowWelcome(false)}
                whileTap={{ scale: 0.95 }}
              >
                בואו נתחיל 🎰
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

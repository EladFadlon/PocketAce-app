import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, GameRecord } from '../types';
import { getRecentGames, calculateCumulativeProfitLoss, getCumulativeStatus } from '../utils/gameHistory';
import { getRegulars, addRegular, removeRegular } from '../utils/regulars';
import '../styles/lobby.css';

interface LobbyProps {
  onStartGame: (selectedNames: string[]) => void;
  user: User;
  onLogout: () => void;
  isPremium: boolean;
  onPremiumChange: (value: boolean) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame, user, onLogout, isPremium, onPremiumChange }) => {
  const CREW_COLORS = [
    'linear-gradient(135deg,#e74c3c,#c0392b)',
    'linear-gradient(135deg,#3498db,#2980b9)',
    'linear-gradient(135deg,#2ecc71,#27ae60)',
    'linear-gradient(135deg,#9b59b6,#8e44ad)',
    'linear-gradient(135deg,#ff6b35,#e55a24)',
    'linear-gradient(135deg,#f39c12,#d68910)',
  ];
  const CREW_SHADOWS = [
    'rgba(231,76,60,0.4)', 'rgba(52,152,219,0.4)', 'rgba(46,204,113,0.4)',
    'rgba(155,89,182,0.4)', 'rgba(255,107,53,0.4)', 'rgba(243,156,18,0.4)',
  ];
  const CREW_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];

  const [showWelcome, setShowWelcome] = useState(false);
  const [recentGames, setRecentGames] = useState<GameRecord[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
  const [status, setStatus] = useState({ badge: '', message: '' });
  const [cumulative, setCumulative] = useState(0);
  const [regulars, setRegulars] = useState<string[]>(() => getRegulars());
  const [selectedRegulars, setSelectedRegulars] = useState<Set<string>>(new Set());
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newRegularName, setNewRegularName] = useState('');
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('pocketAceVisited');
    if (!hasVisited) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowWelcome(true);
      localStorage.setItem('pocketAceVisited', 'true');
    }
    const games = getRecentGames(user.id, 3);
    setRecentGames(games);
    const cumulativeValue = calculateCumulativeProfitLoss(user.id, user.name);
    setCumulative(cumulativeValue);
    setStatus(getCumulativeStatus(cumulativeValue));
  }, [user.id, user.name]);

  const firstName = user.name.split(' ')[0];
  const firstLetter = firstName.charAt(0);

  // no-op stubs — web monetization not yet implemented
  const handlePurchase = () => {
    // TODO: web monetization — call onPremiumChange(true) on success
    void onPremiumChange; // Mark as used
  };
  const handleRestore = () => {
    // TODO: web monetization — call onPremiumChange(true) on success
    void onPremiumChange; // Mark as used
  };

  const handleToggleSelect = (name: string) => {
    setPendingRemove(null);
    setSelectedRegulars(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleLongPressStart = (name: string) => {
    longPressTimer.current = setTimeout(() => setPendingRemove(name), 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleRemoveRegular = (name: string) => {
    removeRegular(name);
    setRegulars(getRegulars());
    setPendingRemove(null);
    setSelectedRegulars(prev => { const next = new Set(prev); next.delete(name); return next; });
  };

  const handleAddRegular = () => {
    const trimmed = newRegularName.trim();
    if (!trimmed) return;
    addRegular(trimmed);
    setRegulars(getRegulars());
    setNewRegularName('');
    setShowAddSheet(false);
  };

  return (
    <div className="lobby-screen">
      {/* Top bar */}
      <div className="lobby-topbar">
        <div className="lobby-user">
          <div className="lobby-avatar">{firstLetter}</div>
          <div>
            <div className="lobby-greeting-label">שלום,</div>
            <div className="lobby-greeting-name">{firstName} 🤙</div>
          </div>
        </div>
      </div>

      <div className="lobby-scroll">
        {/* Stats */}
        {recentGames.length > 0 && (
          <div className="lobby-stats">
            <div className={`lobby-stat-card ${cumulative > 0 ? 'green' : ''}`}>
              <div className={`lobby-stat-value ${cumulative > 0 ? 'green' : ''}`}>
                {cumulative > 0 ? '+' : ''}{cumulative.toFixed(0)}₪
              </div>
              <div className="lobby-stat-label">סה&quot;כ רווח</div>
            </div>
            <div className="lobby-stat-card">
              <div className="lobby-stat-value">{recentGames.length}</div>
              <div className="lobby-stat-label">משחקים</div>
            </div>
            <div className="lobby-stat-card yellow">
              <div className="lobby-stat-value yellow">{status.badge || '🃏'}</div>
              <div className="lobby-stat-label" style={{ color: 'rgba(245,197,24,0.6)' }}>סטטוס</div>
            </div>
          </div>
        )}

        {/* Crew */}
        <div className="lobby-crew" onClick={() => pendingRemove && setPendingRemove(null)}>
          <div className="lobby-section-label">החבר׳ה הקבועים</div>
          <div className="lobby-crew-row">
            {regulars.map((name, i) => {
              const isSelected = selectedRegulars.has(name);
              const isPendingRemove = pendingRemove === name;
              return (
                <div className="lobby-crew-member" key={name}>
                  <div
                    className={`lobby-crew-avatar${isSelected ? ' selected' : ''}${isPendingRemove ? ' pending-remove' : ''}`}
                    style={{
                      background: CREW_COLORS[i % CREW_COLORS.length],
                      boxShadow: isSelected
                        ? `0 0 0 2.5px var(--yellow), 0 4px 12px ${CREW_SHADOWS[i % CREW_SHADOWS.length]}`
                        : `0 4px 12px ${CREW_SHADOWS[i % CREW_SHADOWS.length]}`,
                    }}
                    onClick={() => !isPendingRemove && handleToggleSelect(name)}
                    onPointerDown={() => handleLongPressStart(name)}
                    onPointerUp={handleLongPressEnd}
                    onPointerLeave={handleLongPressEnd}
                  >
                    {CREW_EMOJIS[i % CREW_EMOJIS.length]}
                    {isSelected && <span className="lobby-crew-check">✓</span>}
                    {isPendingRemove && (
                      <span
                        className="lobby-crew-remove-tip"
                        onClick={e => { e.stopPropagation(); handleRemoveRegular(name); }}
                      >הסר?</span>
                    )}
                  </div>
                  <span className="lobby-crew-name">{name}</span>
                </div>
              );
            })}
            <div className="lobby-crew-member">
              <div className="lobby-crew-add" onClick={() => setShowAddSheet(true)}>+</div>
              <span className="lobby-crew-name">הוסף</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="lobby-cta-wrap">
          <motion.button className="lobby-cta" onClick={() => onStartGame([...selectedRegulars])} whileTap={{ scale: 0.97 }}>
            <span>⚡</span>
            <span>פותחים שולחן</span>
            {selectedRegulars.size > 0 && (
              <span className="lobby-cta-badge">{selectedRegulars.size} נבחרו</span>
            )}
            {selectedRegulars.size === 0 && <span>🃏</span>}
          </motion.button>
        </div>

        {/* Recent games */}
        {recentGames.length > 0 && (
          <div className="lobby-history">
            <div className="lobby-section-label">משחקים אחרונים</div>
            {recentGames.map(game => {
              const myResult = game.playerResults?.find(p => p.name === user.name);
              const amount = myResult?.profitLossAfterFee ?? 0;
              return (
                <motion.button
                  key={game.id}
                  className="lobby-history-item"
                  onClick={() => setSelectedGame(game)}
                  whileTap={{ opacity: 0.7 }}
                >
                  <div>
                    <div className="lobby-history-title">
                      {new Date(game.date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })} • {game.debts.length + 1} שחקנים
                    </div>
                    <div className="lobby-history-sub">{game.debts.length} חובות</div>
                  </div>
                  <div className={`lobby-history-amount ${amount >= 0 ? 'win' : 'loss'}`}>
                    {game.topShark ? `🦈 +${game.topShark.amount.toFixed(0)}₪` : `${amount >= 0 ? '+' : ''}${amount.toFixed(0)}₪`}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Premium / Remove Ads */}
        {!isPremium && (
          <div className="lobby-premium-section">
            <motion.button
              className="lobby-premium-btn"
              onClick={handlePurchase}
              whileTap={{ scale: 0.97 }}
            >
              בלי פרסומות. רק פוקר. ♠
            </motion.button>
            <button className="lobby-restore-btn" onClick={handleRestore}>
              שחזר רכישה
            </button>
          </div>
        )}
      </div>

      {/* Reserved layout space for future web ad banner */}
      {!isPremium && <div className="lobby-ad-banner" />}

      {/* Logout */}
      <div className="lobby-logout">
        <button className="lobby-logout-btn" onClick={onLogout}>
          <span>↩</span><span>התנתק</span>
        </button>
      </div>

      {/* Game details bottom sheet */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="lobby-sheet-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              className="lobby-sheet-card"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lobby-sheet-close" onClick={() => setSelectedGame(null)}>✕</button>
              <h2 className="lobby-sheet-title">📊 תוצאות המשחק</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {new Date(selectedGame.date).toLocaleDateString('he-IL')} • מארח: {selectedGame.hostsName}
              </p>
              {selectedGame.topShark && (
                <div style={{ margin: '12px 0', padding: '12px', background: 'rgba(46,204,113,0.08)', borderRadius: 12, border: '1px solid rgba(46,204,113,0.2)' }}>
                  <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>🦈 המנצח</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{selectedGame.topShark.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--green)', fontWeight: 700 }}>+{selectedGame.topShark.amount.toFixed(0)}₪</div>
                </div>
              )}
              {selectedGame.debts.map((debt, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{debt.from}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>חייב ל-{debt.to}</span>
                  <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>{debt.amount.toFixed(0)}₪</span>
                </div>
              ))}
              <button
                onClick={() => setSelectedGame(null)}
                style={{ marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >סגור</button>
            </motion.div>
          </motion.div>
        )}

        {/* Add regular bottom sheet */}
        {showAddSheet && (
          <motion.div
            className="lobby-sheet-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddSheet(false)}
          >
            <motion.div
              className="lobby-sheet-card"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lobby-sheet-close" onClick={() => setShowAddSheet(false)}>✕</button>
              <h2 className="lobby-sheet-title">הוסף קבוע 🤙</h2>
              <input
                className="lobby-add-regular-input"
                type="text"
                placeholder="שם השחקן..."
                value={newRegularName}
                onChange={e => setNewRegularName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddRegular()}
                autoFocus
              />
              <motion.button
                className="lobby-add-regular-btn"
                onClick={handleAddRegular}
                whileTap={{ scale: 0.97 }}
              >+ הוסף</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome popup */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              style={{ background: '#0f0f1a', borderRadius: 20, border: '1px solid var(--border)', padding: 24, width: '100%', maxWidth: 340, position: 'relative', direction: 'rtl' }}
              initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 24 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <button onClick={() => setShowWelcome(false)} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.06)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 8px' }}>ברוכים הבאים ל-Pocket Ace ♠</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>נהל את משחקי הפוקר שלך בקלות. מי חייב למי — ב-10 שניות. 🃏</p>
              <button
                onClick={() => setShowWelcome(false)}
                style={{ width: '100%', background: 'linear-gradient(135deg,var(--yellow),var(--yellow-dark))', color: '#111', border: 'none', padding: 14, borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}
              >בואו נתחיל 🎰</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

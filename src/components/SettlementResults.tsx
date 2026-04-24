import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PlayerSettlement, Debt, GameSettings, User } from '../types';
import { generateWhatsAppMessage, getWhatsAppShareURL } from '../utils/settlements';
import { getLoserInsult } from '../utils/loserInsults';
import { getWinnerInsult } from '../utils/winnerInsults';
import { getRegulars, addRegular } from '../utils/regulars';
import '../styles/results.css';

const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)' },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)' },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)' },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)' },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)' },
];
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];

interface SettlementResultsProps {
  settlements: PlayerSettlement[];
  debts: Debt[];
  gameSettings: GameSettings;
  hostFee: number;
  onPlayAgain: () => void;
  onHome?: () => void;
  user: User;
}

export const SettlementResults: React.FC<SettlementResultsProps> = ({
  settlements,
  debts,
  gameSettings,
  hostFee,
  onPlayAgain,
  onHome,
  user
}) => {
  const [addedToRegulars, setAddedToRegulars] = useState<Set<string>>(() => new Set(getRegulars()));
  const whatsappMessage = generateWhatsAppMessage(gameSettings, settlements, debts, hostFee);
  const whatsappUrl = getWhatsAppShareURL(whatsappMessage);

  const winner = [...settlements].sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee)[0];
  const biggestLoser = [...settlements].sort((a, b) => a.profitLossAfterFee - b.profitLossAfterFee)[0];
  const loserInsult = biggestLoser && biggestLoser.profitLossAfterFee < 0
    ? getLoserInsult(biggestLoser.name)
    : null;

  const winnerInsult = winner && winner.profitLossAfterFee > 0
    ? getWinnerInsult(winner.name)
    : null;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLORS = ['#f5c518', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];
    const pieces = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 30,
      w: 3 + Math.random() * 4,
      h: 5 + Math.random() * 5,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 7,
      vy: 1.4 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));

    let frame = 0;
    let rafId: number;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotV;
        if (frame > 50) p.opacity -= 0.016;
        if (p.y < canvas.height && p.opacity > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      frame++;
      if (alive) rafId = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const timer = setTimeout(() => { rafId = requestAnimationFrame(tick); }, 300);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <motion.div className="results-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative' }}>
      <canvas ref={canvasRef} className="results-confetti" />
      <div className="results-header">
        <div className="results-title">תוצאות המשחק 🏆</div>
        <div className="results-subtitle">
          {settlements.length} שחקנים • {settlements.reduce((s, p) => s + p.totalInvested, 0)}₪ בקופה
        </div>
      </div>

      <div className="results-body">
        {/* Winner hero */}
        {winner && winner.profitLossAfterFee > 0 && (
          <div className="results-winner">
            <div className="results-winner-bg">🦈</div>
            <div className="results-winner-avatar">🦈</div>
            <div style={{ flex: 1 }}>
              <div className="results-winner-label">🏆 המנצח הגדול</div>
              <div className="results-winner-name">{winner.name}</div>
              <div className="results-winner-amount">+{winner.profitLossAfterFee.toFixed(0)}₪ הערב</div>
              {winnerInsult && (
                <div className="results-winner-insult">{winnerInsult}</div>
              )}
            </div>
          </div>
        )}

        {/* All players */}
        <div className="results-players">
          <div className="results-section-label">כל השחקנים</div>
          {settlements
            .slice()
            .sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee)
            .map((s, index) => {
              const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
              const emoji = PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
              const amount = s.profitLossAfterFee;
              return (
                <div
                  className="results-player-row"
                  key={s.id}
                  style={{ animationDelay: `${1.1 + index * 0.1}s` }}
                >
                  <div className="results-player-avatar" style={{ background: color.bg }}>
                    {emoji}
                  </div>
                  <div className="results-player-name">{s.name}</div>
                  <div className={`results-player-amount ${amount >= 0 ? 'win' : 'loss'}`}>
                    {amount >= 0 ? '+' : ''}{amount.toFixed(0)}₪
                  </div>
                  {user.name !== s.name && (
                    addedToRegulars.has(s.name)
                      ? <span className="results-add-regular-done">✓ קבוע</span>
                      : <button
                          className="results-add-regular-btn"
                          onClick={() => {
                            addRegular(s.name);
                            setAddedToRegulars(prev => new Set([...prev, s.name]));
                          }}
                        >+ קבועים</button>
                  )}
                </div>
              );
            })}
        </div>

        {/* Loser insult */}
        {loserInsult && (
          <div className="results-loser-insult">{loserInsult}</div>
        )}

        {/* Debts */}
        {debts.length > 0 && (
          <div className="results-debts">
            <div className="results-section-label results-debts-label">מי חייב למי 💸</div>
            {debts.map((debt, i) => {
              const fromIndex = settlements.findIndex(s => s.id === debt.from.id);
              const toIndex   = settlements.findIndex(s => s.id === debt.to.id);
              const fromColor = PLAYER_COLORS[Math.max(fromIndex, 0) % PLAYER_COLORS.length];
              const toColor   = PLAYER_COLORS[Math.max(toIndex, 0)   % PLAYER_COLORS.length];
              return (
                <div
                  className="results-debt-card"
                  key={i}
                  style={{ animationDelay: `${1.6 + i * 0.12}s` }}
                >
                  <div className="results-debt-avatar" style={{ background: fromColor.bg }}>{PLAYER_EMOJIS[Math.max(fromIndex, 0) % PLAYER_EMOJIS.length]}</div>
                  <div>
                    <div className="results-debt-name">{debt.from.name}</div>
                    <div className="results-debt-to">חייב ל-{debt.to.name}</div>
                  </div>
                  <div className="results-debt-avatar" style={{ background: toColor.bg, marginRight: 'auto' }}>{PLAYER_EMOJIS[Math.max(toIndex, 0) % PLAYER_EMOJIS.length]}</div>
                  <div className="results-debt-amount">{debt.amount.toFixed(0)}₪</div>
                </div>
              );
            })}
          </div>
        )}

        {/* WhatsApp share */}
        <a className="results-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <div className="results-whatsapp-icon">💬</div>
          <div>
            <div className="results-whatsapp-title">שתף לווצאפ</div>
            <div className="results-whatsapp-sub">שלח לקבוצה מי חייב למי</div>
          </div>
          <div className="results-whatsapp-arrow">←</div>
        </a>
      </div>

      <div className="results-footer">
        <button className="results-home-btn" onClick={onHome}>🏠 לובי</button>
        <button className="results-again-btn" onClick={onPlayAgain}>משחק נוסף? יאללה 🃏</button>
      </div>
    </motion.div>
  );
};

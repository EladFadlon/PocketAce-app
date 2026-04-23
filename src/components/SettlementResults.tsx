import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PlayerSettlement, Debt } from '../types';
import { generateWhatsAppMessage, getWhatsAppShareURL } from '../utils/settlements';
import type { GameSettings } from '../types';
import { getLoserInsult } from '../utils/loserInsults';
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

import type { User } from '../types';

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

  return (
    <motion.div className="results-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                <div className="results-player-row" key={s.id}>
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
            <div className="results-section-label">מי חייב למי 💸</div>
            {debts.map((debt, i) => {
              const fromIndex = settlements.findIndex(s => s.id === debt.from.id);
              const toIndex   = settlements.findIndex(s => s.id === debt.to.id);
              const fromColor = PLAYER_COLORS[Math.max(fromIndex, 0) % PLAYER_COLORS.length];
              const toColor   = PLAYER_COLORS[Math.max(toIndex, 0)   % PLAYER_COLORS.length];
              return (
                <div className="results-debt-card" key={i}>
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

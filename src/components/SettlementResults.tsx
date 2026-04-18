import React from 'react';
import { motion } from 'framer-motion';
import { Share2, TrendingUp, TrendingDown } from 'lucide-react';
import type { PlayerSettlement, Debt } from '../types';
import { generateWhatsAppMessage, getWhatsAppShareURL } from '../utils/settlements';
import type { GameSettings } from '../types';
import '../styles/results.css';

// Random insults and compliments
const RANDOM_COMMENTS = [
  'מישהו פה צריך קורס פוקר דחוף',
  'ניצחת ביושר, עכשיו שים טיפ למחלק',
  'זה היה יום של ההלכות של הפוקר',
  'הנקודה הזו לא תשכח כל כך מהר',
  'כל אחד שלוש קרטים על פעמו',
  'רק תמשיך להגיד לעצמך שהייתה לך יד טובה',
  'הכוכב הבא של הפוקר כאן',
  'אולי תשחק קלפים בתור תפקיד רחוק יותר',
  'כל זה היה חלום שקט משום דבר',
  'בא לך לעבור לשולחן הילדים?',
];

function getRandomComment(): string {
  return RANDOM_COMMENTS[Math.floor(Math.random() * RANDOM_COMMENTS.length)];
}

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
  onHome
}) => {
  const winners = settlements
    .filter(s => s.profitLossAfterFee > 0)
    .sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee);

  const losers = settlements
    .filter(s => s.profitLossAfterFee < 0)
    .sort((a, b) => a.profitLossAfterFee - b.profitLossAfterFee);

  const topShark = winners[0];
  const worstDonor = losers[0];

  const whatsappMessage = generateWhatsAppMessage(gameSettings, settlements, debts, hostFee);
  const whatsappUrl = getWhatsAppShareURL(whatsappMessage);

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
      className="results-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="results-header-with-home" variants={itemVariants}>
        <div className="header-content">
          <h1>🎊 תוצאות סופיות</h1>
               <span className="emoji">🐑</span>
          <p className="random-comment">💬 {getRandomComment()}</p>
        </div>
        <motion.button
          className="btn-home-icon"
          onClick={onHome}
          whileTap={{ scale: 0.9 }}
          title="חזור לבית"
        >
          🏠
        </motion.button>
      </motion.div>

      {/* Winners */}
      {winners.length > 0 && (
        <motion.div className="results-section winners" variants={itemVariants}>
          <h2>
            <span className="emoji">🦈</span>
            הכרישים של השכונה
          </h2>
          {topShark && (
            <motion.div className="top-player" variants={itemVariants}>
              <div className="crown">👑</div>
              <div className="top-player-info">
                <div className="top-label">הכריש של השכונה</div>
                <div className="top-name">{topShark.name}</div>
                <div className="top-amount">+{topShark.profitLossAfterFee.toFixed(2)}₪</div>
              </div>
            </motion.div>
          )}
          <div className="results-list">
            {winners.map((player, idx) => (
              <motion.div
                key={player.id}
                className={`result-item winner ${topShark?.id === player.id ? 'is-top' : ''}`}
                variants={itemVariants}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="result-header">
                  <span className="rank">#{idx + 1}</span>
                  <span className="name">{player.name}</span>
                </div>
                <div className="result-amounts">
                  <div className="profit">
                    <TrendingUp size={18} />
                    <span>+{player.profitLossAfterFee.toFixed(2)}₪</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Losers */}
      {losers.length > 0 && (
        <motion.div className="results-section losers" variants={itemVariants}>
          <h2>
            <span className="emoji">�</span>
            הכבשה הנדיבה
          </h2>
          {worstDonor && (
            <motion.div className="top-player donor" variants={itemVariants}>
              <div className="crown">🏆</div>
              <div className="top-player-info">
                <div className="top-label">הכבשה הנדיבה</div>
                <div className="top-name">{worstDonor.name}</div>
                <div className="top-amount">{worstDonor.profitLossAfterFee.toFixed(2)}₪</div>
              </div>
            </motion.div>
          )}
          <div className="results-list">
            {losers.map((player, idx) => (
              <motion.div
                key={player.id}
                className={`result-item loser ${worstDonor?.id === player.id ? 'is-top' : ''}`}
                variants={itemVariants}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="result-header">
                  <span className="rank">#{idx + 1} {worstDonor?.id === player.id && '🐑'}</span>
                  <span className="name">{player.name}</span>
                </div>
                <div className="result-amounts">
                  <div className="loss">
                    <TrendingDown size={18} />
                    <span>{player.profitLossAfterFee.toFixed(2)}₪</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settlements */}
      {debts.length > 0 && (
        <motion.div className="results-section settlements" variants={itemVariants}>
          <h2>💳 מי שחייב – שישלם עכשיו</h2>
          <div className="debts-list">
            {debts.map((debt, idx) => (
              <motion.div
                key={idx}
                className="debt-item"
                variants={itemVariants}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="debt-direction">
                  <span className="debtor">{debt.from.name}</span>
                  <span className="arrow">→</span>
                  <span className="creditor">{debt.to.name}</span>
                </div>
                <span className="amount">{debt.amount.toFixed(2)}₪</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Winners Breakdown - Ensure every winner appears with incoming payments */}
      {winners.length > 0 && (
        <motion.div className="results-section winnings-breakdown" variants={itemVariants}>
          <h2>💰 פירוט הכנסות לכל זוכה</h2>
          <div className="winnings-list">
            {winners.map((winner, idx) => {
              const incomingPayments = debts.filter(d => d.to.id === winner.id);
              const totalIncoming = incomingPayments.reduce((sum, d) => sum + d.amount, 0);
              
              return (
                <motion.div
                  key={winner.id}
                  className="winnings-item"
                  variants={itemVariants}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="winner-name">{winner.name}</div>
                  <div className="incoming-payments">
                    {incomingPayments.length > 0 ? (
                      incomingPayments.map((payment, pidx) => (
                        <div key={pidx} className="payment-line">
                          <span className="from-name">← {payment.from.name}</span>
                          <span className="payment-amount">+{payment.amount.toFixed(2)}₪</span>
                        </div>
                      ))
                    ) : (
                      <div className="payment-line no-payments">
                        <span className="warning">⚠️ אין תשלומים רשומים</span>
                      </div>
                    )}
                  </div>
                  <div className="winner-total">
                    <strong>סה"כ: +{totalIncoming.toFixed(2)}₪</strong>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Operating Cost */}
      <motion.div className="host-fee" variants={itemVariants}>
        <span className="icon">💼</span>
        <span className="text">עלות תפעול: {hostFee}₪ (קוזז מהקופה)</span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div className="action-buttons" variants={itemVariants}>
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
          whileTap={{ scale: 0.95 }}
        >
          <Share2 size={20} />
          שיתוף ב-WhatsApp
        </motion.a>
        <motion.button
          className="btn-play-again"
          onClick={onPlayAgain}
          whileTap={{ scale: 0.95 }}
        >
          משחק נוסף 🎰
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

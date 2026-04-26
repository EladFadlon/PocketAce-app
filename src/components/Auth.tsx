import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createUser } from '../utils/auth';
import type { User } from '../types';
import '../styles/auth.css';

interface AuthProps {
  onAuth: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('נא הזן שם');
      return;
    }
    const user = createUser(name);
    onAuth(user);
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-spade">♠</div>

      {(['♠', '♣', '♥', '♦'] as const).map((suit, i) => (
        <div
          key={suit}
          className="auth-suit"
          style={{
            fontSize: [60, 44, 52, 40][i],
            color: `rgba(200,190,168,${[0.04, 0.03, 0.035, 0.025][i]})`,
            top:  ['8%', '70%', '60%', '18%'][i],
            left: ['5%', '76%',  '7%', '80%'][i],
            animation: `auth-float ${[4, 4.8, 5.2, 4.4][i]}s ease-in-out infinite`,
            animationDelay: `${[0, 0.7, 1.3, 0.4][i]}s`,
          }}
        >
          {suit}
        </div>
      ))}

      <div className="auth-inner">
        <motion.div
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="auth-logo-wrap">
            <svg className="auth-logo-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Back card */}
              <g transform="rotate(-12, 60, 70)">
                <rect x="18" y="22" width="60" height="80" rx="8" fill="#272118" stroke="rgba(200,190,168,0.15)" strokeWidth="1.5"/>
                <rect x="22" y="26" width="52" height="72" rx="6" fill="#2E2820"/>
                <line x1="22" y1="38" x2="74" y2="38" stroke="rgba(200,190,168,0.06)" strokeWidth="1"/>
                <line x1="22" y1="50" x2="74" y2="50" stroke="rgba(200,190,168,0.06)" strokeWidth="1"/>
                <line x1="22" y1="62" x2="74" y2="62" stroke="rgba(200,190,168,0.06)" strokeWidth="1"/>
                <line x1="22" y1="74" x2="74" y2="74" stroke="rgba(200,190,168,0.06)" strokeWidth="1"/>
                <line x1="22" y1="86" x2="74" y2="86" stroke="rgba(200,190,168,0.06)" strokeWidth="1"/>
              </g>
              {/* Front card — ace of spades */}
              <g transform="rotate(8, 60, 70)">
                <rect x="30" y="18" width="62" height="84" rx="8" fill="#201C18" stroke="rgba(200,190,168,0.2)" strokeWidth="1.5"/>
                <text x="37" y="35" fontFamily="serif" fontSize="13" fontWeight="700" fill="#C8BEA8" textAnchor="middle">A</text>
                <text x="37" y="45" fontFamily="serif" fontSize="9" fill="#C8BEA8" textAnchor="middle">♠</text>
                <text x="61" y="72" fontFamily="serif" fontSize="36" fill="#C8BEA8" textAnchor="middle">♠</text>
                <g transform="rotate(180, 84, 87)">
                  <text x="84" y="80" fontFamily="serif" fontSize="13" fontWeight="700" fill="#C8BEA8" textAnchor="middle">A</text>
                  <text x="84" y="90" fontFamily="serif" fontSize="9" fill="#C8BEA8" textAnchor="middle">♠</text>
                </g>
                <rect x="30" y="18" width="62" height="3" rx="2" fill="#4A7A5A"/>
              </g>
            </svg>
            <div className="auth-logo-name">PocketAce</div>
            <div className="auth-logo-sub">ניהול שולחן פוקר</div>
          </div>

          <div className="auth-card surface">
            <form className="auth-inputs" onSubmit={handleSubmit}>
              <div>
                <div className="auth-input-label">איך קוראים לך?</div>
                <input
                  className="input-new"
                  type="text"
                  placeholder="שם / כינוי"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  autoComplete="name"
                  autoFocus
                  style={{ direction: 'rtl', minHeight: 'unset' }}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <motion.button
                className="btn-new btn-sage auth-cta"
                type="submit"
                whileTap={{ scale: 0.97 }}
              >
                כנסו ♠
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

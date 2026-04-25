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
            <div className="auth-logo-text">
              Pocket<br />
              <span className="auth-logo-ace">Ace</span>
            </div>
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

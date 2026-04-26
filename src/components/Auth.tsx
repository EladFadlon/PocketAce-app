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
            <svg className="auth-logo-svg" width="120" height="120" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="256" cy="256" r="220" fill="none" stroke="#4A7A5A" strokeWidth="28"/>
              <circle cx="256" cy="256" r="206" fill="#1A1614"/>
              <path d="M256,143 C210,168 156,209 156,263 C156,303 180,321 210,313 C194,345 174,361 148,369 L364,369 C338,361 318,345 302,313 C332,321 356,303 356,263 C356,209 302,168 256,143 Z" fill="#C8BEA8"/>
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

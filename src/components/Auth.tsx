import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User as UserIcon } from 'lucide-react';
import { sendMagicLink } from '../utils/auth';
import '../styles/auth.css';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'initial' | 'sent'>('initial');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !name.trim()) {
      setError('נא הזן שם');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('נא הזן כתובת אימייל תקינה');
      return;
    }

    setLoading(true);
    try {
      const result = await sendMagicLink(email, isLogin ? undefined : name);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep('sent');
    } catch {
      setError('אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-glow" />
      <div className="auth-inner">
        <AnimatePresence mode="wait">
          {step === 'initial' ? (
            <motion.div
              key="initial"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="auth-logo-card">♠</div>
              <h1 className="auth-app-name">Pocket Ace</h1>
              <p className="auth-tagline">תן לקלפים לדבר בשבילך ♠</p>

              <div className="auth-tab-switcher">
                <button
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => { setIsLogin(true); setError(''); }}
                >כניסה</button>
                <button
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => { setIsLogin(false); setError(''); }}
                >הרשמה</button>
              </div>

              <form className="auth-inputs" onSubmit={handleSubmit} style={{ width: '100%' }}>
                {!isLogin && (
                  <div className="auth-input-row">
                    <span className="auth-input-icon"><UserIcon size={15} /></span>
                    <input
                      type="text"
                      placeholder="שם מלא"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="auth-input-row">
                  <span className="auth-input-icon"><Mail size={15} /></span>
                  <input
                    type="email"
                    placeholder="כתובת אימייל"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-cta" type="submit" disabled={loading}>
                  {loading ? '...' : 'בוא נשחק 🤙'}
                </button>
              </form>

              <div className="auth-divider">
                {isLogin
                  ? <span onClick={() => { setIsLogin(false); setError(''); }}>פתח חשבון — זה שניה</span>
                  : <span onClick={() => { setIsLogin(true); setError(''); }}>כבר יש לך חשבון? כנסו</span>
                }
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="auth-logo-card">📧</div>
              <h2 className="auth-verify-title">בדוק את האימייל שלך</h2>
              <p className="auth-verify-sub">שלחנו קישור כניסה ל־{email}</p>
              <p className="auth-verify-sub" style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                לחץ על הקישור במייל כדי להיכנס
              </p>

              <div className="auth-link" style={{ marginTop: '2rem' }}>
                <span onClick={() => { setStep('initial'); setError(''); }}>← חזור</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

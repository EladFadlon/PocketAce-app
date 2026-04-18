import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Phone, User as UserIcon } from 'lucide-react';
import { sendVerificationCode, verifyCodeAndRegister } from '../utils/auth';
import type { User } from '../types';
import '../styles/auth.css';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'initial' | 'verification'>('initial');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && !name.trim()) {
        setError('נא הזן שם');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setError('נא הזן מספר טלפון');
        setLoading(false);
        return;
      }

      const result = sendVerificationCode(phone, isLogin ? '' : name);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setStep('verification');
      setVerificationCode('');
    } catch {
      setError('אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setVerificationLoading(true);

    try {
      if (verificationCode.trim().length !== 6) {
        setCodeError('קוד חייב להיות 6 ספרות');
        setVerificationLoading(false);
        return;
      }

      const result = verifyCodeAndRegister(verificationCode);
      if (result.error) {
        setCodeError(result.error);
        setVerificationLoading(false);
        return;
      }

      if (result.user) {
        setTimeout(() => onAuthSuccess(result.user!), 300);
      }
    } catch {
      setCodeError('אירעה שגיאה. נסה שוב.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const switchTab = (login: boolean) => {
    setIsLogin(login);
    setError('');
    setName('');
    setPhone('');
  };

  const handleBackToPhone = () => {
    setStep('initial');
    setVerificationCode('');
    setCodeError('');
  };

  /* ── Verification step ── */
  if (step === 'verification') {
    return (
      <div className="auth-screen">
        <div className="auth-bg" />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="auth-logo">
            <motion.div
              className="auth-logo-icon"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
            >
              <Zap size={44} />
            </motion.div>
            <h1>Pocket Ace</h1>
          </div>

          <div className="auth-verify-header">
            <h2>📱 אימות מספר טלפון</h2>
            <p>
              קוד אימות נשלח אל <strong>{phone}</strong>.<br />
              הקוד תקף ל-5 דקות.
            </p>
          </div>

          <form onSubmit={handleVerificationSubmit} className="auth-form-body">
            <div className="auth-field">
              <label htmlFor="otp">קוד אימות (6 ספרות)</label>
              <input
                id="otp"
                className="auth-otp-input"
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={e => {
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setCodeError('');
                }}
                placeholder="000000"
                disabled={verificationLoading}
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            <AnimatePresence>
              {codeError && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {codeError}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className="btn-auth-submit"
              disabled={verificationLoading || verificationCode.length !== 6}
              whileTap={{ scale: 0.97 }}
            >
              {verificationLoading ? '⏳ מאמת...' : 'אימות וכניסה ✓'}
            </motion.button>

            <motion.button
              type="button"
              className="btn-auth-back"
              onClick={handleBackToPhone}
              whileTap={{ scale: 0.97 }}
            >
              חזור לשינוי מספר
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  /* ── Initial step ── */
  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <motion.div
            className="auth-logo-icon"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
          >
            <Zap size={44} />
          </motion.div>
          <h1>Pocket Ace</h1>
          <p className="auth-tagline">ניהול משחקי פוקר בכיס</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <motion.button
            type="button"
            className={`auth-tab${isLogin ? ' auth-tab--active' : ''}`}
            onClick={() => switchTab(true)}
            whileTap={{ scale: 0.97 }}
          >
            כניסה
          </motion.button>
          <motion.button
            type="button"
            className={`auth-tab${!isLogin ? ' auth-tab--active' : ''}`}
            onClick={() => switchTab(false)}
            whileTap={{ scale: 0.97 }}
          >
            הרשמה
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleInitialSubmit} className="auth-form-body">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                className="auth-field"
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="name">
                  <UserIcon size={14} />
                  שם מלא
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="ישראל ישראלי"
                  disabled={loading}
                  autoFocus={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label htmlFor="phone">
              <Phone size={14} />
              מספר טלפון
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="050-000-0000"
              disabled={loading}
              autoFocus={isLogin}
              autoComplete="tel"
              dir="ltr"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="btn-auth-submit"
            disabled={loading || (!isLogin && !name.trim()) || !phone.trim()}
            whileTap={{ scale: 0.97 }}
          >
            {loading
              ? '⏳ רגע...'
              : isLogin
                ? 'שלח קוד כניסה →'
                : 'שלח קוד אימות →'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

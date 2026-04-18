import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User as UserIcon } from 'lucide-react';
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

  // retained for potential future use
  void switchTab;
  void handleBackToPhone;

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

              <form className="auth-inputs" onSubmit={handleInitialSubmit} style={{ width: '100%' }}>
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
                  <span className="auth-input-icon"><Phone size={15} /></span>
                  <input
                    type="tel"
                    placeholder="מספר פלאפון"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="tel"
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
                  ? <><span onClick={() => setIsLogin(false)}>פתח חשבון — זה שניה</span></>
                  : <><span onClick={() => setIsLogin(true)}>כבר יש לך חשבון? כנסו</span></>
                }
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="auth-logo-card">🔑</div>
              <h2 className="auth-verify-title">קוד אימות נשלח</h2>
              <p className="auth-verify-sub">הזן את הקוד שקיבלת למספר {phone}</p>

              <form className="auth-inputs" onSubmit={handleVerificationSubmit} style={{ width: '100%' }}>
                <div className="auth-input-row">
                  <span className="auth-input-icon">💬</span>
                  <input
                    type="text"
                    placeholder="קוד אימות"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>

                {codeError && <p className="auth-error">{codeError}</p>}

                <button className="auth-cta" type="submit" disabled={verificationLoading}>
                  {verificationLoading ? '...' : 'אמת ✓'}
                </button>
              </form>

              <div className="auth-link">
                <span onClick={() => setStep('initial')}>← חזור</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User as UserIcon } from 'lucide-react';
import { sendOtp, verifyEmailOtp } from '../utils/auth';
import '../styles/auth.css';

const CODE_LENGTH = 6;

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'initial' | 'verify'>('initial');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
      const result = await sendOtp(email, isLogin ? undefined : name);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep('verify');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch {
      setError('אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError('');
    if (digits.length === CODE_LENGTH) {
      setLoading(true);
      try {
        const result = await verifyEmailOtp(email, digits);
        if (result.error) {
          setError('קוד שגוי. נסה שוב.');
          setCode('');
        }
        // on success App.tsx onAuthStateChange fires SIGNED_IN automatically
      } catch {
        setError('אירעה שגיאה. נסה שוב.');
        setCode('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setError('');
    setCode('');
    setLoading(true);
    try {
      const result = await sendOtp(email, isLogin ? undefined : name);
      if (result.error) setError(result.error);
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

              <form className="auth-inputs" onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
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
              key="verify"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="auth-logo-card">📧</div>
              <h2 className="auth-verify-title">הזן את הקוד</h2>
              <p className="auth-verify-sub">שלחנו קוד בן 6 ספרות ל־{email}</p>

              <input
                ref={codeInputRef}
                className="auth-otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={CODE_LENGTH}
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="000000"
                dir="ltr"
                disabled={loading}
                autoComplete="one-time-code"
              />

              {error && <p className="auth-error">{error}</p>}
              {loading && <p className="auth-verify-sub">מאמת...</p>}

              <div className="auth-link" style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                <span onClick={handleResend}>שלח שוב</span>
                <span onClick={() => { setStep('initial'); setCode(''); setError(''); }}>← חזור</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import '../styles/install-prompt.css';

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  'standalone' in navigator && (navigator as Navigator & { standalone: boolean }).standalone;

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pocketAce_installDismissed');
    if (isIos() && !isStandalone() && !dismissed) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('pocketAce_installDismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="install-prompt">
      <button className="install-prompt__close" onClick={dismiss} aria-label="סגור">
        ✕
      </button>
      להתקנה: לחץ{' '}
      <svg className="install-prompt__share" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>{' '}
      ואז "הוסף למסך הבית"
    </div>
  );
}

import type { User } from '../types';

const STORAGE_KEY = 'pocketAce_user';
const USERS_KEY = 'pocketAce_users';
const DEVICE_KEY = 'pocketAce_deviceId';
const REGISTRATION_LOG_KEY = 'pocketAce_registrationLog';
const VERIFICATION_CODE_KEY = 'pocketAce_verificationCode';
const VERIFICATION_PHONE_KEY = 'pocketAce_verificationPhone';
const VERIFICATION_NAME_KEY = 'pocketAce_verificationName';
const MAX_ACCOUNTS_PER_DEVICE = 1;
const REGISTRATION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const VERIFICATION_CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a unique device fingerprint
 */
const generateDeviceFingerprint = (): string => {
  const navigator_info = {
    userAgent: navigator.userAgent,
    language: navigator.language,
  };

  const finger = JSON.stringify(navigator_info);
  let hash = 0;

  for (let i = 0; i < finger.length; i++) {
    const char = finger.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
};

/**
 * Get or create device ID
 */
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
};

/**
 * Validate phone number format (international format)
 */
const isValidPhone = (phone: string): boolean => {
  // Accept formats: +1234567890, +1-234-567-8900, 0512345678, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get registration log
 */
const getRegistrationLog = (): { [deviceId: string]: number[] } => {
  try {
    const stored = localStorage.getItem(REGISTRATION_LOG_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Save registration log
 */
const saveRegistrationLog = (log: { [deviceId: string]: number[] }) => {
  localStorage.setItem(REGISTRATION_LOG_KEY, JSON.stringify(log));
};

/**
 * Check if device can register a new account (rate limiting)
 */
const canRegisterNewAccount = (): { allowed: boolean; message?: string } => {
  const deviceId = getDeviceId();
  const log = getRegistrationLog();
  const deviceRegistrations = log[deviceId] || [];

  const now = Date.now();

  // Filter out registrations older than 24 hours
  const recentRegistrations = deviceRegistrations.filter(timestamp => now - timestamp < REGISTRATION_COOLDOWN_MS);

  // Check max accounts per device
  if (recentRegistrations.length >= MAX_ACCOUNTS_PER_DEVICE) {
    const oldestRegistration = Math.min(...recentRegistrations);
    const timeUntilNextRegistration = oldestRegistration + REGISTRATION_COOLDOWN_MS - now;
    const hoursRemaining = Math.ceil(timeUntilNextRegistration / (60 * 60 * 1000));

    return {
      allowed: false,
      message: `ניתן ליצור חשבון חדש בעוד ${hoursRemaining} שעות`
    };
  }

  return { allowed: true };
};

/**
 * Log a new registration attempt
 */
const logRegistration = () => {
  const deviceId = getDeviceId();
  const log = getRegistrationLog();

  if (!log[deviceId]) {
    log[deviceId] = [];
  }

  log[deviceId].push(Date.now());
  saveRegistrationLog(log);
};

/**
 * Get all registered users
 */
const getAllUsers = (): { [key: string]: User } => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Save users to localStorage
 */
const saveUsers = (users: { [key: string]: User }) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Send verification code (mock - stores in sessionStorage and returns code for display)
 */
export const sendVerificationCode = (phone: string, name: string = ''): { code: string; error?: string } => {
  try {
    console.log('📱 Starting verification code flow:', { phone, name });
    
    // Validate phone format
    if (!isValidPhone(phone)) {
      console.error('❌ Invalid phone format:', phone);
      return { code: '', error: 'נא הזן מספר טלפון תקין' };
    }
    console.log('✓ Phone format valid');

    // Validate name only if provided (for registration)
    if (name && name.trim().length < 2) {
      console.error('❌ Invalid name length:', name.length);
      return { code: '', error: 'שם חייב להיות לפחות 2 תווים' };
    }
    console.log('✓ Name valid');

    // Check if phone already exists
    const users = getAllUsers();
    console.log('🔍 Total users:', Object.keys(users).length);
    
    const phoneExists = Object.values(users).find(u => u.phone.toLowerCase() === phone.toLowerCase());
    if (phoneExists) {
      console.log('ℹ️ Phone already registered (login flow)');
    }
    console.log('✓ Phone check complete');

    // Check rate limiting only for new registrations (empty name = login)
    if (!name) {
      console.log('✓ Login flow - skipping rate limit check');
    } else {
      const rateLimitCheck = canRegisterNewAccount();
      if (!rateLimitCheck.allowed) {
        console.error('❌ Rate limit exceeded:', rateLimitCheck.message);
        return { code: '', error: rateLimitCheck.message };
      }
      console.log('✓ Rate limit check passed');
    }

    // Generate code
    const code = generateVerificationCode();
    const expiryTime = Date.now() + VERIFICATION_CODE_EXPIRY_MS;

    console.log('✓ Generated verification code:', code);

    // Store temporarily in sessionStorage (expires in 5 minutes)
    sessionStorage.setItem(VERIFICATION_CODE_KEY, JSON.stringify({ code, expiryTime }));
    sessionStorage.setItem(VERIFICATION_PHONE_KEY, phone);
    sessionStorage.setItem(VERIFICATION_NAME_KEY, name);

    console.log('✅ Verification data stored in sessionStorage');
    return { code };
  } catch (err) {
    console.error('❌ sendVerificationCode error:', err);
    return { code: '', error: 'אירעה שגיאה בשליחת קוד' };
  }
};

/**
 * Verify the SMS code and complete registration or login
 */
export const verifyCodeAndRegister = (enteredCode: string): { user: User | null; error?: string } => {
  try {
    const codeData = sessionStorage.getItem(VERIFICATION_CODE_KEY);
    const phone = sessionStorage.getItem(VERIFICATION_PHONE_KEY);
    const name = sessionStorage.getItem(VERIFICATION_NAME_KEY);

    console.log('🔍 Verification data:', { codeData: !!codeData, phone, name });

    if (!codeData || !phone) {
      console.error('❌ Missing verification data');
      return { user: null, error: 'פג תוקף קוד. בקשו קוד חדש.' };
    }

    const { code, expiryTime } = JSON.parse(codeData);
    console.log('🔍 Code data parsed:', { code, enteredCode, expiryTime, now: Date.now() });

    // Check expiry
    if (Date.now() > expiryTime) {
      console.error('❌ Code expired');
      sessionStorage.removeItem(VERIFICATION_CODE_KEY);
      sessionStorage.removeItem(VERIFICATION_PHONE_KEY);
      sessionStorage.removeItem(VERIFICATION_NAME_KEY);
      return { user: null, error: 'קוד פג תוקף. בקשו קוד חדש.' };
    }

    // Check code
    if (enteredCode.trim() !== code) {
      console.error('❌ Code mismatch:', { entered: enteredCode.trim(), expected: code });
      return { user: null, error: 'קוד לא נכון' };
    }

    const users = getAllUsers();

    // If name is provided, this is a registration flow
    if (name && name.trim().length >= 2) {
      // Create new user
      const userId = `user_${Date.now()}`;
      const newUser: User = {
        id: userId,
        name: name,
        phone: phone,
        createdAt: Date.now()
      };

      console.log('✓ Creating new user:', newUser);
      users[userId] = newUser;
      saveUsers(users);
      logRegistration();

      // Clear verification data
      sessionStorage.removeItem(VERIFICATION_CODE_KEY);
      sessionStorage.removeItem(VERIFICATION_PHONE_KEY);
      sessionStorage.removeItem(VERIFICATION_NAME_KEY);

      // Auto-login
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      console.log('✅ User registered and logged in');

      return { user: newUser };
    } else {
      // This is a login flow
      const user = Object.values(users).find(u => u.phone && u.phone.toLowerCase() === phone.toLowerCase());

      if (!user) {
        console.error('❌ User not found:', phone);
        sessionStorage.removeItem(VERIFICATION_CODE_KEY);
        sessionStorage.removeItem(VERIFICATION_PHONE_KEY);
        sessionStorage.removeItem(VERIFICATION_NAME_KEY);
        return { user: null, error: 'מספר טלפון זה לא רשום' };
      }

      // Clear verification data
      sessionStorage.removeItem(VERIFICATION_CODE_KEY);
      sessionStorage.removeItem(VERIFICATION_PHONE_KEY);
      sessionStorage.removeItem(VERIFICATION_NAME_KEY);

      // Login
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      console.log('✅ User logged in:', user.name);

      return { user };
    }
  } catch (err) {
    console.error('❌ Verification error:', err);
    return { user: null, error: 'אירעה שגיאה בהרשמה' };
  }
};

/**
 * Get current logged-in user or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Login user by phone number
 */
export const loginUser = (phone: string): { user: User | null; error?: string } => {
  // Validate phone format
  if (!isValidPhone(phone)) {
    return { user: null, error: 'נא הזן מספר טלפון תקין' };
  }

  const users = getAllUsers();
  const user = Object.values(users).find(u => u.phone && u.phone.toLowerCase() === phone.toLowerCase());

  if (!user) {
    return { user: null, error: 'מספר טלפון זה לא רשום' };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

  return { user };
};

/**
 * Logout current user
 */
export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};


/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

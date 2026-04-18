import { 
  signInWithPhoneNumber, 
  signOut,
  RecaptchaVerifier,
  type ConfirmationResult
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';

const USERS_KEY = 'pocketAce_users';
const USER_STORAGE_KEY = 'pocketAce_user';
const DEVICE_KEY = 'pocketAce_deviceId';
const REGISTRATION_LOG_KEY = 'pocketAce_registrationLog';
const INITIAL_CREDITS = 3;
const REGISTRATION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

let confirmationResult: ConfirmationResult | null = null;

/**
 * Generate device fingerprint
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
    hash = hash & hash;
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
 * Get all users
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
 * Save users
 */
const saveUsers = (users: { [key: string]: User }) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
 * Check if device can register
 */
const canRegisterNewAccount = (): { allowed: boolean; message?: string } => {
  const deviceId = getDeviceId();
  const log = getRegistrationLog();
  const deviceRegistrations = log[deviceId] || [];

  const now = Date.now();
  const recentRegistrations = deviceRegistrations.filter(
    timestamp => now - timestamp < REGISTRATION_COOLDOWN_MS
  );

  if (recentRegistrations.length >= 1) {
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
 * Log registration
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
 * Initialize reCAPTCHA
 */
export const initializeRecaptcha = () => {
  try {
    const verifier = new RecaptchaVerifier(auth, 'sign-in-button', {
      size: 'invisible',
      callback: (response: string) => {
        console.log('reCAPTCHA verified:', response);
      }
    });
    return verifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    return null;
  }
};

/**
 * Send phone verification SMS
 */
export const sendPhoneVerification = async (
  phone: string,
  name: string = ''
): Promise<{ error?: string }> => {
  try {
    console.log('📱 Starting Firebase phone verification:', { phone, name });

    // For registration, validate name
    if (name && name.trim().length < 2) {
      console.error('❌ Invalid name');
      return { error: 'שם חייב להיות לפחות 2 תווים' };
    }

    // For registration with name, check if phone already registered
    if (name) {
      const users = getAllUsers();
      const phoneExists = Object.values(users).find(
        u => u.phone && u.phone === phone
      );
      if (phoneExists) {
        console.error('❌ Phone already registered');
        return { error: 'מספר טלפון זה כבר רשום' };
      }

      // Check rate limit
      const rateLimitCheck = canRegisterNewAccount();
      if (!rateLimitCheck.allowed) {
        console.error('❌ Rate limit exceeded');
        return { error: rateLimitCheck.message };
      }
    } else {
      // For login, check phone exists
      const users = getAllUsers();
      const phoneExists = Object.values(users).find(
        u => u.phone && u.phone === phone
      );
      if (!phoneExists) {
        console.error('❌ Phone not found');
        return { error: 'מספר טלפון זה לא רשום' };
      }
    }

    // Initialize reCAPTCHA verifier
    const appVerifier = initializeRecaptcha();
    if (!appVerifier) {
      console.error('❌ Failed to initialize reCAPTCHA');
      return { error: 'שגיאה בהאימות. נסה שוב' };
    }

    // Send verification code
    console.log('🔐 Sending SMS to:', phone);
    confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
    
    // Store for verification
    if (name) {
      sessionStorage.setItem('firebase_registration_name', name);
    }
    sessionStorage.setItem('firebase_registration_phone', phone);

    console.log('✅ Verification code sent');
    return {};
  } catch (error: any) {
    console.error('❌ Phone verification error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-phone-number') {
      return { error: 'מספר טלפון לא תקין' };
    }
    if (error.code === 'auth/too-many-requests') {
      return { error: 'יותר מדי ניסיונות. נסה מאוחר יותר' };
    }
    
    return { error: 'שגיאה בשליחת קוד. נסה שוב' };
  }
};

/**
 * Verify code and complete registration/login
 */
export const verifyPhoneCode = async (code: string): Promise<{ user: User | null; error?: string }> => {
  try {
    if (!confirmationResult) {
      console.error('❌ No confirmation result');
      return { user: null, error: 'פג תוקף הקוד. בקש קוד חדש' };
    }

    console.log('🔐 Verifying code:', code);
    const result = await confirmationResult.confirm(code);
    const firebaseUser = result.user;

    console.log('✅ Code verified, Firebase user:', firebaseUser.uid);

    // Get stored data
    const name = sessionStorage.getItem('firebase_registration_name');
    const phone = sessionStorage.getItem('firebase_registration_phone');

    if (!phone) {
      console.error('❌ Missing phone');
      return { user: null, error: 'שגיאה בהאימות. נסה שוב' };
    }

    const users = getAllUsers();
    const userId = firebaseUser.uid;

    if (name) {
      // Registration - create new user
      console.log('📝 Registering new user');

      const newUser: User = {
        id: userId,
        name,
        phone,
        credits: INITIAL_CREDITS,
        createdAt: Date.now()
      };

      console.log('✓ Creating user:', userId);
      users[userId] = newUser;
      saveUsers(users);
      logRegistration();

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      sessionStorage.removeItem('firebase_registration_name');
      sessionStorage.removeItem('firebase_registration_phone');

      console.log('✅ User registered successfully');
      return { user: newUser };
    } else {
      // Login - find existing user by phone
      console.log('🔑 Logging in existing user');

      const user = Object.values(users).find(u => u.phone === phone);
      if (!user) {
        console.error('❌ User not found for phone:', phone);
        return { user: null, error: 'משתמש לא נמצא' };
      }

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      sessionStorage.removeItem('firebase_registration_phone');

      console.log('✅ User logged in:', user.id);
      return { user };
    }
  } catch (error: any) {
    console.error('❌ Code verification error:', error);

    if (error.code === 'auth/invalid-verification-code') {
      return { user: null, error: 'קוד לא נכון' };
    }
    if (error.code === 'auth/code-expired') {
      return { user: null, error: 'קוד פג תוקף. בקש קוד חדש' };
    }

    return { user: null, error: 'שגיאה בהאימות. נסה שוב' };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Logout
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log('✅ User logged out');
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
};

/**
 * Update user credits
 */
export const updateUserCredits = (userId: string, newAmount: number) => {
  const users = getAllUsers();
  if (users[userId]) {
    users[userId].credits = newAmount;
    saveUsers(users);
    
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      currentUser.credits = newAmount;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    }
  }
};

/**
 * Decrement user credits
 */
export const decrementUserCredits = (userId: string, amount: number = 1): boolean => {
  const users = getAllUsers();
  if (users[userId]) {
    if (users[userId].credits >= amount) {
      users[userId].credits -= amount;
      saveUsers(users);
      
      const currentUser = getCurrentUser();
      if (currentUser?.id === userId) {
        currentUser.credits = users[userId].credits;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      }
      return true;
    }
  }
  return false;
};

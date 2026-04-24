import type { User } from '../types';

const USER_KEY = 'pocketAce_user';

export const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export const createUser = (name: string): User => {
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: '',
    createdAt: Date.now(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const signOut = (): void => {
  localStorage.removeItem(USER_KEY);
};

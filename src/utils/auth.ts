import type { User } from '../types';
import { storage } from './storage';

export const getStoredUser = (): User | null => storage.getUser();

export const createUser = (name: string): User => {
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: '',
    createdAt: Date.now(),
  };
  storage.setUser(user);
  return user;
};

export const signOut = (): void => storage.clearUser();

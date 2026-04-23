import { supabase } from '../config/supabase';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

export const sessionToUser = (session: Session): User => ({
  id: session.user.id,
  name: (session.user.user_metadata?.name as string) || '',
  email: session.user.email || '',
  createdAt: new Date(session.user.created_at).getTime(),
});

export const sendOtp = async (
  email: string,
  name?: string
): Promise<{ error?: string }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: window.location.origin + '/auth',
      ...(name?.trim() ? { data: { name: name.trim() } } : {}),
    },
  });
  return error ? { error: error.message } : {};
};

export const verifyEmailOtp = async (
  email: string,
  token: string
): Promise<{ error?: string }> => {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  return error ? { error: error.message } : {};
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

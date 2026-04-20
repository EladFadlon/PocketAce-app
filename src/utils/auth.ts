import { supabase } from '../config/supabase';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

export const sessionToUser = (session: Session): User => ({
  id: session.user.id,
  name: (session.user.user_metadata?.name as string) || '',
  email: session.user.email || '',
  createdAt: new Date(session.user.created_at).getTime(),
});

export const sendMagicLink = async (
  email: string,
  name?: string
): Promise<{ error?: string }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      ...(name?.trim() ? { data: { name: name.trim() } } : {}),
    },
  });
  return error ? { error: error.message } : {};
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

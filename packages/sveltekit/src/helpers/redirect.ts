import { goto } from '$app/navigation';
import { session } from '$app/stores';
import type { User } from '@supabase/supabase-js';

export function redirect(path = '/') {
  return async (user: User | null) => {
    await goto(path);
    session.set({ user });
  };
}

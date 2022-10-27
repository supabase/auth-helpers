import { getConfig } from '../config';
import { isBrowser } from '@supabase/auth-helpers-shared';
import { createClient, type Session } from '@supabase/supabase-js';
import type { LoadEvent } from '@sveltejs/kit';
import type { TypedSupabaseClient } from '../types';

export function getLoadSupabaseClient(event: LoadEvent): TypedSupabaseClient {
  const { supabaseUrl, supabaseKey, options, globalInstance } = getConfig();

  if (isBrowser()) {
    return globalInstance;
  }

  return createClient(supabaseUrl, supabaseKey, {
    ...options,
    auth: {
      autoRefreshToken: false,
      storage: {
        async getItem(key) {
          let session: Session | null = null;
          if (typeof event.data?.session !== 'undefined') {
            session = event.data.session;
          } else {
            const parentData = await event.parent();
            session = parentData?.session;
          }
          return session ? JSON.stringify(session) : null;
        },
        removeItem(key) {
          // this should not be needed
          // we are inside load on the server, the session should be valid for atleast 60 seconds
          // or not valid at all
        },
        setItem(key, value) {
          // this should not be needed
          // we are inside load on the server, the session should be valid for atleast 60 seconds
          // or not valid at all
        }
      }
    }
  });
}

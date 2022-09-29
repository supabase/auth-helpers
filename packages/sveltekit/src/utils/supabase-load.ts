import { getConfig } from '../config';
import { isBrowser } from '@supabase/auth-helpers-shared';
import { createClient } from '@supabase/supabase-js';
import type { LoadEvent } from '@sveltejs/kit';
import { PKG_NAME, PKG_VERSION } from '../constants';

export function createLoadSupabaseClient(event: LoadEvent) {
  const { supabaseUrl, supabaseKey, options, globalInstance } = getConfig();
  if (isBrowser()) {
    return globalInstance;
  }

  return createClient<App.Supabase['Database'], App.Supabase['SchemaName']>(
    supabaseUrl,
    supabaseKey,
    {
      ...options,
      global: {
        ...options.global,
        headers: {
          ...options.global?.headers,
          'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
        }
      },
      auth: {
        storage: {
          async getItem(key) {
            const { session } = await event.parent();
            return session ? JSON.stringify(session) : null;
          },
          async removeItem(key) {
            // this should not be needed
            // we are inside load on the server, the session should be valid for atleast 60 seconds
            // or not valid at all
          },
          async setItem(key, value) {
            // this should not be needed
            // we are inside load on the server, the session should be valid for atleast 60 seconds
            // or not valid at all
          }
        }
      }
    }
  );
}

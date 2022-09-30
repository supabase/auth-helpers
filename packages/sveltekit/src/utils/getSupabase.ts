import type { LoadEvent, RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import type { TypedSupabaseClient } from '../types';
import { getLoadSupabaseClient } from './supabase-load';
import { getRequestSupabaseClient } from './supabase-request';

export function getSupabase(
  event: RequestEvent | ServerLoadEvent | LoadEvent
): TypedSupabaseClient {
  const requestOrServerLoadEvent = event as ServerLoadEvent | RequestEvent;
  const loadEvent = event as LoadEvent;

  if (typeof loadEvent.depends === 'function') {
    // depend on `supabase:auth` to allow reloading all data fetched with rls
    loadEvent.depends('supabase:auth');
  }

  // prefer request/server-load over load
  if (requestOrServerLoadEvent.locals) {
    return getRequestSupabaseClient(requestOrServerLoadEvent);
  }
  if (typeof loadEvent.parent === 'function') {
    return getLoadSupabaseClient(loadEvent);
  }

  throw new Error('invalid event');
}

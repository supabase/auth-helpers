import type { Session } from '@supabase/supabase-js';
import type { LoadEvent, RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import type { TypedSupabaseClient } from '../types';
import { getLoadSupabaseClient } from './supabase-load';
import { getRequestSupabaseClient } from './supabase-request';

export async function getSupabase(
  event: RequestEvent | ServerLoadEvent | LoadEvent
): Promise<{ supabaseClient: TypedSupabaseClient; session: Session | null }> {
  const requestOrServerLoadEvent = event as ServerLoadEvent | RequestEvent;
  const loadEvent = event as LoadEvent;
  let supabaseClient: TypedSupabaseClient;

  if (typeof loadEvent.depends === 'function') {
    // depend on `supabase:auth` to allow reloading all data fetched with rls
    loadEvent.depends('supabase:auth');
  }

  // prefer request/server-load over load
  if (requestOrServerLoadEvent.locals) {
    supabaseClient = getRequestSupabaseClient(requestOrServerLoadEvent);
  } else if (typeof loadEvent.parent === 'function') {
    supabaseClient = getLoadSupabaseClient(loadEvent);
  } else {
    throw new Error('invalid event');
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  return {
    supabaseClient,
    session
  };
}

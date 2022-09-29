import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoadEvent, RequestEvent } from '@sveltejs/kit';
import { createLoadSupabaseClient } from './supabase-load';
import { createRequestSupabaseClient } from './supabase-request';

export function getSupabase(
  event:
    | Pick<RequestEvent, 'cookies' | 'locals' | 'request'>
    | Pick<LoadEvent, 'parent' | 'fetch'>
): SupabaseClient<App.Supabase['Database'], App.Supabase['SchemaName']> {
  const requestOrServerLoadEvent = event as RequestEvent;

  if (requestOrServerLoadEvent.locals) {
    return createRequestSupabaseClient(requestOrServerLoadEvent);
  }

  const loadEvent = event as LoadEvent;
  if (typeof loadEvent.parent === 'function') {
    return createLoadSupabaseClient(loadEvent);
  }

  throw new Error('invalid event');
}

import type { ServerLoadEvent } from '@sveltejs/kit';
import { getRequestSupabaseClient } from './supabase-request';

export async function getServerSession(
  event: ServerLoadEvent,
  expiry_margin = 60
) {
  const supabase = getRequestSupabaseClient(event);

  let {
    data: { session }
  } = await supabase.auth.getSession();

  if (
    session?.expires_at &&
    session.expires_at + expiry_margin <= Date.now() / 1000
  ) {
    const refreshed = await supabase.auth.setSession(session);

    session = refreshed.data.session;
  }

  return session;
}

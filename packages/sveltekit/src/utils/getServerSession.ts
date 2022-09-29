import type { ServerLoadEvent } from '@sveltejs/kit';
import { getSupabase } from './getSupabase';

export async function getServerSession(
  event: Pick<ServerLoadEvent, 'cookies' | 'locals' | 'request'>,
  expiry_margin = 60
) {
  const supabase = getSupabase(event);

  let {
    data: { session }
  } = await supabase.auth.getSession();

  if (
    session?.expires_at &&
    session.expires_at + expiry_margin <= Date.now() / 1000
  ) {
    const refreshed = await supabase.auth.setSession(session.refresh_token);

    session = refreshed.data.session;
  }

  return session;
}

import { CookieOptions } from '@supabase/auth-helpers-shared';
import { supabaseClient } from '../utils/initSupabase.server';
import { redirect } from '@remix-run/node';
import { getSession, destroySession } from '../utils/cookies';
import { DataFunctionArgsWithResponse } from './auth';

export interface HandleLogoutOptions {
  cookieOptions?: CookieOptions;
  returnTo?: string;
}

export default async function handleLogout(
  context: DataFunctionArgsWithResponse,
  options: HandleLogoutOptions = {}
) {
  // TODO! get query from params in callback.ts
  let returnTo = null;
  // let { returnTo } = request.query;
  if (!returnTo) returnTo = options?.returnTo ?? '/';
  returnTo = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  returnTo = returnTo.charAt(0) === '/' ? returnTo : `/${returnTo}`;

  // Logout request to Gotrue
  const session = await getSession(context.request.headers.get('Cookie'));
  const access_token = session.get('accessToken');

  if (access_token) {
    supabaseClient.auth.api.signOut(access_token);
  }

  const remixSession = await getSession();
  await destroySession(remixSession);

  return redirect(returnTo);
}

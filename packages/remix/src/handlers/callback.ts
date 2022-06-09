import { CookieOptions, setCookies } from '@supabase/auth-helpers-shared';
import getUser from '../utils/getUser';
import { getSession, commitSession, destroySession } from '../utils/cookies';
import { DataFunctionArgsWithResponse } from './auth';

export interface HandleCallbackOptions {
  cookieOptions?: CookieOptions;
}

type AuthCookies = Parameters<typeof setCookies>[2];

export default async function handleCallback(
  context: DataFunctionArgsWithResponse,
  options: HandleCallbackOptions = {}
) {
  if (context.request.method !== 'POST') {
    return new Response('Not allowed', {
      headers: {
        Allow: 'POST'
      },
      status: 405
    });
  }
  const { event, session } = await context.request.json();

  if (!event) throw new Error('Auth event missing!');
  if (event === 'USER_UPDATED') {
    await getUser(context, { forceRefresh: true });
  }
  if (event === 'SIGNED_IN') {
    if (!session) throw new Error('Auth session missing!');
    const remixSession = await getSession();
    remixSession.set('accessToken', session.access_token);
    remixSession.set('refreshToken', session.refresh_token);
    if (session.provider_token) {
      remixSession.set('providerToken', session.provider_token);
    }
    const cookie = await commitSession(remixSession);
    context.response.headers.set('Set-Cookie', cookie);
  }
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    const remixSession = await getSession();
    await destroySession(remixSession);
  }
  return context.response;
}

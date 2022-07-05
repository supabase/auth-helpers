import { createCookieSessionStorage } from '@remix-run/node';

const MAX_AGE = 60 * 60 * 8; // 8 hours

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // TODO! pull these out of shared object
    cookie: {
      name: 'sb:token',
      maxAge: MAX_AGE,
      expires: new Date(Date.now() + MAX_AGE * 1000),
      domain: '',
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
      secrets: ['supabase is the dopest!']
    }
  });

export { getSession, commitSession, destroySession };

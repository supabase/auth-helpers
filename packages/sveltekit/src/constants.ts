import type { CookieOptions } from './types';

export const ENDPOINT_PREFIX = '/api/auth';

export const TOKEN_REFRESH_MARGIN = 10;

export const COOKIE_OPTIONS: CookieOptions = {
  maxAge: 365 * 24 * 60 * 60,
  path: '/',
  sameSite: 'strict',
  httpOnly: true,
  secure: false
};

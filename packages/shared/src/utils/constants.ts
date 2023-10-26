import { DefaultCookieOptions } from '../types';

export const DEFAULT_COOKIE_OPTIONS: DefaultCookieOptions = {
	path: '/',
	sameSite: 'lax',
	maxAge: 60 * 60 * 24 * 365 * 1000
};

import { CookieOptions } from '../types';

export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
	path: '/',
	sameSite: 'lax',
	httpOnly: false,
	maxAge: 60 * 60 * 24 * 365
};

import { CookieOptions } from '../types';

export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
	path: '/',
	maxAge: 60 * 60 * 24 * 365 * 1000,
	httpOnly: false
};

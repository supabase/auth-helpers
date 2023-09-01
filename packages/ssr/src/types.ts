import type { CookieSerializeOptions } from 'cookie';

export type CookieOptions = Partial<
	Pick<CookieSerializeOptions, 'domain' | 'secure' | 'path' | 'sameSite' | 'maxAge'>
>;

export type CookieOptionsWithName = { name?: string } & CookieOptions;

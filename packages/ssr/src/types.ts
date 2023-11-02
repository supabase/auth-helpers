import type { CookieSerializeOptions } from 'cookie';

export type CookieOptions = Partial<CookieSerializeOptions>;
export type CookieOptionsWithName = { name?: string } & CookieOptions;
export type CookieMethods = {
	get?: (key: string) => Promise<string | null | undefined> | string | null | undefined;
	set?: (key: string, value: string, options: CookieOptions) => Promise<void> | void;
	remove?: (key: string, options: CookieOptions) => Promise<void> | void;
};

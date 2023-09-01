import type { CookieSerializeOptions } from 'cookie';

export type CookieOptions = Partial<CookieSerializeOptions>;
export type CookieOptionsWithName = { name?: string } & CookieOptions;

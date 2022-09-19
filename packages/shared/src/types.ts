import type { CookieSerializeOptions } from 'cookie';

export type CookieOptions = { name?: string } & Pick<
  CookieSerializeOptions,
  'domain' | 'secure' | 'path' | 'sameSite' | 'maxAge'
>;

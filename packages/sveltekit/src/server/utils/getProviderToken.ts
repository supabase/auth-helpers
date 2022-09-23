import type { Cookies } from '@sveltejs/kit';
import { getServerConfig } from '../config';

export function getProviderToken(cookies: Cookies) {
  const { cookieOptions } = getServerConfig();
  return cookies.get(`${cookieOptions.name}-provider-token`);
}

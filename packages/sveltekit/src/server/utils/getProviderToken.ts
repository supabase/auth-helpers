import type { Cookies } from '@sveltejs/kit';
import { getConfig } from '../../config';

export function getProviderToken(cookies: Cookies) {
  const { cookieOptions } = getConfig();
  return cookies.get(`${cookieOptions.name}-provider-token`);
}

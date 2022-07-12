import {
  COOKIE_OPTIONS,
  parseCookie,
  ProviderTokenNotFound,
  type CookieOptions
} from '@supabase/auth-helpers-shared';

interface GetProviderTokenOptions {
  cookieOptions?: CookieOptions;
}

/**
 * Retrieve provider token from cookies
 * @param { Request } req FetchAPI request object
 * @param { GetProviderTokenOptions } options
 * @returns {string}
 */
export function getProviderToken(
  req: Request,
  options: GetProviderTokenOptions = {}
) {
  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
  const cookies = parseCookie(req.headers.get('cookie'));
  const providerToken = cookies[`${cookieOptions.name}-provider-token`];

  if (!providerToken) {
    throw new ProviderTokenNotFound();
  }

  return providerToken;
}

import {
  COOKIE_OPTIONS,
  ProviderTokenNotFound,
  type CookieOptions
} from '@supabase/auth-helpers-shared';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next';

interface GetProviderTokenOptions {
  cookieOptions?: CookieOptions;
}

/**
 * Retrieve provider token from cookies
 * @param context
 * @param { GetProviderTokenOptions } options
 * @returns {string}
 */
export function getProviderToken(
  context:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
  options: GetProviderTokenOptions = {}
) {
  const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
  const providerToken =
    context.req.cookies[`${cookieOptions.name}-provider-token`];

  if (!providerToken) {
    throw new ProviderTokenNotFound();
  }

  return providerToken;
}

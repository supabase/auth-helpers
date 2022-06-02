import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { CookieOptions, COOKIE_OPTIONS, TOKEN_REFRESH_MARGIN } from '@supabase/auth-helpers-shared';
import getAccessToken from './getAccessToken';

/**
 * ## Protecting API routes
 * Wrap an API Route to check that the user has a valid session. If they're not logged in the handler will return a
 * 401 Unauthorized.
 *
 * ```js
 * // pages/api/protected-route.js
 * import { withApiAuth, supabaseServerClient } from '@supabase/auth-helpers-nextjs';
 *
 * export default withApiAuth(async function ProtectedRoute(req, res) {
 *   // Run queries with RLS on the server
 *   const { data } = await supabaseServerClient({ req, res }).from('test').select('*');
 *   res.json(data)
 * });
 * ```
 *
 * If you visit `/api/protected-route` without a valid session cookie, you will get a 401 response.
 *
 * @category Server
 */
export default function withApiAuth(
  handler: NextApiHandler,
  options: { cookieOptions?: CookieOptions; tokenRefreshMargin?: number } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
      const tokenRefreshMargin =
        options.tokenRefreshMargin ?? TOKEN_REFRESH_MARGIN;
      const accessToken = await getAccessToken(
        { req, res },
        { cookieOptions, tokenRefreshMargin }
      );
      if (!accessToken) throw new Error('No access token!');
      try {
        await handler(req, res);
      } catch (error) {
        res.status(500).json({
          error: String(error)
        });
        return;
      }
    } catch (error) {
      res.status(401).json({
        error: 'not_authenticated',
        description:
          'The user does not have an active session or is not authenticated'
      });
      return;
    }
  };
}

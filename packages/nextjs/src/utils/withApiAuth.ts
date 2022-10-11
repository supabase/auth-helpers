import {
  AuthHelperError,
  CookieOptions,
  createServerSupabaseClient,
  ensureArray,
  filterCookies,
  serializeCookie
} from '@supabase/auth-helpers-shared';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { PKG_NAME, PKG_VERSION } from '../constants';
import { AddParameters } from '../types';

/**
 * ## Protecting API routes
 * Wrap an API Route to check that the user has a valid session. If they're not logged in the handler will return a
 * 401 Unauthorized.
 *
 * ```js
 * // pages/api/protected-route.js
 * import { withApiAuth } from '@supabase/auth-helpers-nextjs';
 *
 * export default withApiAuth(async function ProtectedRoute(req, res, supabase) {
 *   // Run queries with RLS on the server
 *   const { data } = await supabase.from('test').select('*');
 *   res.json(data)
 * });
 * ```
 *
 * If you visit `/api/protected-route` without a valid session cookie, you will get a 401 response.
 *
 * @category Server
 */
export default function withApiAuth<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database,
  ResponseType = any
>(
  handler: AddParameters<
    NextApiHandler<ResponseType>,
    [SupabaseClient<Database, SchemaName>]
  >,
  options: { cookieOptions?: CookieOptions } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        throw new Error(
          'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!'
        );
      }

      const supabase = createServerSupabaseClient<Database, SchemaName>({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        getCookie(name) {
          return req.cookies[name];
        },
        setCookie(name, value, options) {
          const newSetCookies = filterCookies(
            ensureArray(res.getHeader('set-cookie')?.toString() ?? []),
            name
          );
          const newSessionStr = serializeCookie(name, value, {
            ...options,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false
          });

          res.setHeader('set-cookie', [...newSetCookies, newSessionStr]);
        },
        getRequestHeader: (key) => {
          const header = res.getHeader(key);
          if (typeof header === 'number') {
            return String(header);
          }

          return header;
        },
        options: {
          global: {
            headers: {
              'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
            }
          }
        },
        cookieOptions: options.cookieOptions
      });

      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!session)
        throw new AuthHelperError('Unauthenticated', 'unauthenticated');

      try {
        await handler(req, res, supabase);
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

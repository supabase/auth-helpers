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
 * @deprecated Use `createServerSupabaseClient` within your `NextApiHandler` instead. See the [docs](https://github.com/supabase/auth-helpers/blob/main/packages/nextjs/MIGRATION_GUIDE.md#migrating-to-05x) for examples.
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
          const header = req.headers[key];
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

import {
  CookieNotParsed,
  CookieOptions,
  createServerSupabaseClient,
  AuthHelperError,
  filterCookies,
  ensureArray,
  serializeCookie
} from '@supabase/auth-helpers-shared';
import { SupabaseClient } from '@supabase/supabase-js';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { PKG_NAME, PKG_VERSION } from '../constants';
import { AddParameters } from '../types';

/**
 * @deprecated Use `createServerSupabaseClient` within `getServerSideProps` instead. See the [docs](https://github.com/supabase/auth-helpers/blob/main/packages/nextjs/MIGRATION_GUIDE.md#migrating-to-05x) for examples.
 */
export default function withPageAuth<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database,
  ResponseType extends Record<string, any> = any
>({
  authRequired = true,
  redirectTo = '/',
  getServerSideProps = undefined,
  cookieOptions = {}
}: {
  authRequired?: boolean;
  redirectTo?: string;
  getServerSideProps?: AddParameters<
    GetServerSideProps<ResponseType>,
    [SupabaseClient<Database, SchemaName>]
  >;
  cookieOptions?: CookieOptions;
} = {}) {
  return async (context: GetServerSidePropsContext) => {
    try {
      if (!context.req.cookies) {
        throw new CookieNotParsed();
      }

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
        getRequestHeader: (key) => context.req.headers[key],

        getCookie(name) {
          return context.req.cookies[name];
        },
        setCookie(name, value, options) {
          const newSetCookies = filterCookies(
            ensureArray(context.res.getHeader('set-cookie')?.toString() ?? []),
            name
          );
          const newSessionStr = serializeCookie(name, value, {
            ...options,
            // Allow supabase-js on the client to read the cookie as well
            httpOnly: false
          });

          context.res.setHeader('set-cookie', [
            ...newSetCookies,
            newSessionStr
          ]);
        },
        options: {
          global: {
            headers: {
              'X-Client-Info': `${PKG_NAME}@${PKG_VERSION}`
            }
          }
        },
        cookieOptions
      });

      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }
      if (authRequired && !session) {
        throw new AuthHelperError('Unauthenticated', 'unauthenticated');
      }

      let ret: any = { props: {} };
      if (getServerSideProps) {
        try {
          ret = await getServerSideProps(context, supabase);
        } catch (error) {
          ret = {
            props: {
              error: String(error)
            }
          };
        }
      }

      return {
        ...ret,
        props: {
          initialSession: session,
          user: session?.user ?? null,
          ...ret.props
        }
      };
    } catch (e) {
      if (authRequired) {
        return {
          redirect: {
            destination: redirectTo,
            permanent: false
          }
        };
      }

      return { props: {} };
    }
  };
}

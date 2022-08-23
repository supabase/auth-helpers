import {
  CookieNotParsed,
  CookieOptions,
  createServerSupabaseClient,
  AuthHelperError
} from '@supabase/auth-helpers-shared';
import { SupabaseClient } from '@supabase/supabase-js';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { AddParameters } from '../types';

/**
 * ## Protecting Pages with Server Side Rendering (SSR)
 * If you wrap your `getServerSideProps` with {@link withPageAuth} your props object will be augmented with
 * the user object {@link User}
 *
 * ```js
 * // pages/profile.js
 * import { withPageAuth } from '@supabase/auth-helpers-nextjs';
 *
 * export default function Profile({ user }) {
 *   return <div>Hello {user.name}</div>;
 * }
 *
 * export const getServerSideProps = withPageAuth({ redirectTo: '/login' });
 * ```
 *
 * If there is no authenticated user, they will be redirect to your home page, unless you specify the `redirectTo` option.
 *
 * You can pass in your own `getServerSideProps` method, the props returned from this will be merged with the
 * user props.
 *
 * ```js
 * // pages/protected-page.js
 * import { withPageAuth } from '@supabase/auth-helpers-nextjs';
 *
 * export default function ProtectedPage({ user, customProp }) {
 *   return <div>Protected content</div>;
 * }
 *
 * export const getServerSideProps = withPageAuth({
 *   redirectTo: '/foo',
 *   async getServerSideProps(ctx, supabase) {
 *     // Run queries with RLS on the server
 *     const { data } = await supabase.from('test').select('*');
 *     return { props: { data } };
 *   }
 * });
 * ```
 *
 * @category Server
 */
export default function withPageAuth({
  authRequired = true,
  redirectTo = '/',
  getServerSideProps = undefined,
  cookieOptions = {}
}: {
  authRequired?: boolean;
  redirectTo?: string;
  getServerSideProps?: AddParameters<
    GetServerSideProps,
    [SupabaseClient<any, 'public', any>]
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

      // TODO: add this
      // headers: {
      //   'X-Client-Info': `${PKG_NAME.replace('@', '').replace(
      //     '/',
      //     '-'
      //   )}/${PKG_VERSION}`
      // }

      const supabase = createServerSupabaseClient({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        getRequestHeader: (key) => context.req.headers[key],
        getResponseHeader: (key) => {
          const header = context.res.getHeader(key);
          if (typeof header === 'number') {
            return String(header);
          }

          return header;
        },
        setHeader: (key, value) => context.res.setHeader(key, value),
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

      return ret;
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

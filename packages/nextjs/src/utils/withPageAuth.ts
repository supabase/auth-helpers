import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { jwtDecoder } from 'shared/utils/jwt';
import { CookieOptions } from 'shared/types';
import { COOKIE_OPTIONS, TOKEN_REFRESH_MARGIN } from 'shared/utils/constants';
import getUser from './getUser';

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
 * user props. You can also access the user session data by calling `getUser` inside of this method, eg:
 *
 * ```js
 * // pages/protected-page.js
 * import { withPageAuth, getUser } from '@supabase/supabase-auth-helpers/nextjs';
 *
 * export default function ProtectedPage({ user, customProp }) {
 *   return <div>Protected content</div>;
 * }
 *
 * export const getServerSideProps = withPageAuth({
 *   redirectTo: '/foo',
 *   async getServerSideProps(ctx) {
 *     // Run queries with RLS on the server
 *     const { data } = await supabaseServerClient(ctx).from('test').select('*');
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
  cookieOptions = {},
  tokenRefreshMargin = TOKEN_REFRESH_MARGIN
}: {
  authRequired?: boolean;
  redirectTo?: string;
  getServerSideProps?: GetServerSideProps;
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
} = {}) {
  return async (context: GetServerSidePropsContext) => {
    try {
      if (!context.req.cookies) {
        throw new Error('Not able to parse cookies!');
      }
      cookieOptions = { ...COOKIE_OPTIONS, ...cookieOptions };
      const access_token =
        context.req.cookies[`${cookieOptions.name}-access-token`];
      if (!access_token) {
        throw new Error('No cookie found!');
      }

      let user, accessToken;
      // Get payload from cached access token.
      const jwtUser = jwtDecoder(access_token);
      if (!jwtUser?.exp) {
        throw new Error('Not able to parse JWT payload!');
      }
      const timeNow = Math.round(Date.now() / 1000);
      if (jwtUser.exp < timeNow + tokenRefreshMargin) {
        // JWT is expired, let's refresh from Gotrue
        const response = await getUser(context, { cookieOptions });
        user = response.user;
        accessToken = response.accessToken;
      } else {
        // Transform JWT and add note that it ise cached from JWT.
        user = {
          id: jwtUser.sub,
          aud: null,
          role: null,
          email: null,
          email_confirmed_at: null,
          phone: null,
          confirmed_at: null,
          last_sign_in_at: null,
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: null,
          updated_at: null,
          'supabase-auth-helpers-note':
            'This user payload is retrieved from the cached JWT and might be stale. If you need up to date user data, please call the `getUser` method in a server-side context!'
        };
        const mergedUser = { ...user, ...jwtUser };
        user = mergedUser;
        accessToken = access_token;
      }

      if (!user) {
        throw new Error('No user found!');
      }

      let ret: any = { props: {} };
      if (getServerSideProps) {
        try {
          ret = await getServerSideProps(context);
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
        props: { ...ret.props, user: user, accessToken: accessToken }
      };
    } catch (e) {
      if (authRequired)
        return {
          redirect: {
            destination: redirectTo,
            permanent: false
          }
        };
      return {
        props: { user: null, accessToken: null, error: String(e) }
      };
    }
  };
}

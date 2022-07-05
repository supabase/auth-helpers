import {
  CookieOptions,
  COOKIE_OPTIONS,
  jwtDecoder,
  TOKEN_REFRESH_MARGIN
} from '@supabase/auth-helpers-shared';
import getUser from './getUser';
import {
  LoaderFunction,
  ActionFunction,
  DataFunctionArgs,
  redirect,
  json
} from '@remix-run/node';
import { getSession } from './cookies';
import { DataFunctionArgsWithResponse } from '../handlers/auth';

/**
 * ## Protecting Pages with Server Side Rendering (SSR)
 * If you wrap your `loader` or `action` function with {@link withAuth} your props object will be augmented with
 * the user object {@link User}
 *
 * ```js
 * // pages/profile.js
 * import { withAuth } from '@supabase/auth-helpers-remix';
 *
 * export default function Profile({ user }) {
 *   return <div>Hello {user.name}</div>;
 * }
 *
 * export const loader = withAuth({ redirectTo: '/login' });
 * export const action = withAuth({ authRequired: true });
 * ```
 *
 * If there is no authenticated user, they will be redirect to your home page, unless you specify the `redirectTo` option.
 *
 * You can pass in your own `loader` or `action` function, the props returned from this will be merged with the
 * user props. You can also access the user session data by calling `getUser` inside of this method, eg:
 *
 * ```js
 * // pages/protected-page.js
 * import { withAuth } from '@supabase/auth-helpers-remix';
 *
 * export default function ProtectedPage({ user, customProp }) {
 *   return <div>Protected content</div>;
 * }
 *
 * export const getServerSideProps = withAuth({
 *   redirectTo: '/foo',
 *   async loader(ctx) {
 *     // Run queries with RLS on the server
 *     const { data } = await supabaseServerClient(ctx).from('test').select('*');
 *     return { props: { data } };
 *   }
 *   async action(ctx) {
 *     // Run queries with RLS on the server
 *     const { data } = await supabaseServerClient(ctx).from('test').select('*');
 *     return { props: { data } };
 *   }
 * });
 * ```
 *
 * @category Server
 */
export default function withAuth({
  authRequired = true,
  redirectTo = '/',
  loader = undefined,
  action = undefined,
  cookieOptions = {},
  tokenRefreshMargin = TOKEN_REFRESH_MARGIN
}: {
  authRequired?: boolean;
  redirectTo?: string;
  loader?: LoaderFunction;
  action?: ActionFunction;
  cookieOptions?: CookieOptions;
  tokenRefreshMargin?: number;
} = {}) {
  return async (context: DataFunctionArgs): Promise<Response> => {
    try {
      if (!context.request.headers.get('Cookie')) {
        throw new Error('Not able to parse cookies!');
      }
      cookieOptions = { ...COOKIE_OPTIONS, ...cookieOptions };
      const session = await getSession(context.request.headers.get('Cookie'));
      const access_token = session.get('accessToken');

      if (!access_token) {
        throw new Error('No cookie found!');
      }

      const response = new Response();
      const contextWithResponse: DataFunctionArgsWithResponse = {
        ...context,
        response
      };

      let user, accessToken;
      // Get payload from cached access token.
      const jwtUser = jwtDecoder(access_token);
      if (!jwtUser?.exp) {
        throw new Error('Not able to parse JWT payload!');
      }
      const timeNow = Math.round(Date.now() / 1000);
      if (jwtUser.exp < timeNow + tokenRefreshMargin) {
        // JWT is expired, let's refresh from Gotrue
        const response = await getUser(contextWithResponse, { cookieOptions });
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
      if (loader) {
        try {
          ret = await loader(context);
        } catch (error) {
          ret = {
            props: {
              error: String(error)
            }
          };
        }
      }
      if (action) {
        try {
          ret = await action(context);
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
      if (authRequired) {
        return redirect(redirectTo, 302);
      }

      return json({ user: null, accessToken: null, error: String(e) });
    }
  };
}

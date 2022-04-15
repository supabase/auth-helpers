import {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse
} from 'next';
import { jwtDecoder } from '../../shared/utils/jwt';
import { CookieOptions } from '../types';
import { COOKIE_OPTIONS } from '../../shared/utils/constants';
import getAccessToken from './getAccessToken';
import getUser from './getUser';

/**
 * ## Protecting Pages with Server Side Rendering (SSR)
 * If you wrap your `getServerSideProps` with {@link withAuthRequired} your props object will be augmented with
 * the user object {@link User}
 *
 * ```js
 * // pages/profile.js
 * import { withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs';
 *
 * export default function Profile({ user }) {
 *   return <div>Hello {user.name}</div>;
 * }
 *
 * export const getServerSideProps = withAuthRequired({ redirectTo: '/login' });
 * ```
 *
 * If there is no authenticated user, they will be redirect to your home page, unless you specify the `redirectTo` option.
 *
 * You can pass in your own `getServerSideProps` method, the props returned from this will be merged with the
 * user props. You can also access the user session data by calling `getUser` inside of this method, eg:
 *
 * ```js
 * // pages/protected-page.js
 * import { withAuthRequired, getUser } from '@supabase/supabase-auth-helpers/nextjs';
 *
 * export default function ProtectedPage({ user, customProp }) {
 *   return <div>Protected content</div>;
 * }
 *
 * export const getServerSideProps = withAuthRequired({
 *   redirectTo: '/foo',
 *   async getServerSideProps(ctx) {
 *     // Run queries with RLS on the server
 *     const { data } = await supabaseServerClient(ctx).from('test').select('*');
 *     return { props: { data } };
 *   }
 * });
 * ```
 *
 * ## Protecting API routes
 * Wrap an API Route to check that the user has a valid session. If they're not logged in the handler will return a
 * 401 Unauthorized.
 *
 * ```js
 * // pages/api/protected-route.js
 * import { withAuthRequired, supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
 *
 * export default withAuthRequired(async function ProtectedRoute(req, res) {
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

export type WithAuthRequiredArg =
  | {
      redirectTo?: string;
      getServerSideProps?: GetServerSideProps;
      cookieOptions?: CookieOptions;
    }
  | NextApiHandler;

export default function withAuthRequired(
  arg?: WithAuthRequiredArg,
  options: { cookieOptions?: CookieOptions } = {}
) {
  if (typeof arg === 'function') {
    return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
      try {
        const cookieOptions = { ...COOKIE_OPTIONS, ...options.cookieOptions };
        const accessToken = await getAccessToken(
          { req, res },
          { cookieOptions }
        );
        if (!accessToken) throw new Error('No access token!');
        await arg(req, res);
      } catch (error) {
        res.status(401).json({
          error: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated'
        });
        return;
      }
    };
  } else {
    let {
      getServerSideProps = undefined,
      redirectTo = '/',
      cookieOptions = {}
    } = arg ? arg : {};

    return async (context: GetServerSidePropsContext) => {
      let user, accessToken;

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

        // Get payload from cached access token.
        const jwtUser = jwtDecoder(access_token);
        if (!jwtUser?.exp) {
          throw new Error('Not able to parse JWT payload!');
        }
        const timeNow = Math.round(Date.now() / 1000);
        if (jwtUser.exp < timeNow) {
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
      } catch (e) {
        return {
          redirect: {
            destination: redirectTo,
            permanent: false
          }
        };
      }

      let ret: any = { props: {} };
      if (getServerSideProps) {
        ret = await getServerSideProps(context);
      }
      return {
        ...ret,
        props: { ...ret.props, user: user, accessToken: accessToken }
      };
    };
  }
}

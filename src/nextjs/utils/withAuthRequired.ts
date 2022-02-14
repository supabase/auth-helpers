import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { jwtDecoder } from '../../shared/utils/jwt';
import { CookieOptions } from '../types';
import { COOKIE_OPTIONS } from './constants';
import getUser from './getUser';

/**
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
 *     // Access the user object
 *     const { user, accessToken } = await getUser(ctx);
 *     return { props: { email: user!.email } };
 *   }
 * });
 * ```
 *
 * @category Server
 */
export default function withAuthRequired(
  options: {
    redirectTo?: string;
    getServerSideProps?: GetServerSideProps;
    cookieOptions?: CookieOptions;
  } = {}
) {
  const {
    getServerSideProps,
    redirectTo = '/',
    cookieOptions = COOKIE_OPTIONS
  } = options;
  return async (context: GetServerSidePropsContext) => {
    if (!context.req.cookies) {
      throw new Error('Not able to parse cookies!');
    }
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
    if (jwtUser.exp < timeNow) {
      // JWT is expired, let's refresh from Gotrue
      const response = await getUser(context, cookieOptions);
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
        note: 'This user payload is retrieved from the cached JWT and might be stale. If you need up to date user data, please call the `getUser` method in a server-side context!'
      };
      const mergedUser = { ...user, ...jwtUser };
      user = mergedUser;
      accessToken = access_token;
    }

    if (!user) {
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

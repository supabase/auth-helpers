import { GetServerSideProps, GetServerSidePropsContext } from 'next';
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
  } = {}
) {
  const { getServerSideProps, redirectTo = '/' } = options;
  return async (context: GetServerSidePropsContext) => {
    const { user } = await getUser(context);

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
    return { ...ret, props: { ...ret.props, user: user } };
  };
}

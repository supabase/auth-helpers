import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { User } from '@supabase/supabase-js';
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
 * export const getServerSideProps = withAuthRequired();
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
    const user: User | null = await getUser(context);

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

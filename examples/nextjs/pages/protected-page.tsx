// pages/protected-page.js
import {
  withAuthRequired,
  getUser,
  setServerAuth,
  User
} from '@supabase/supabase-auth-helpers/nextjs';
import { supabase } from '../utils/initSupabase';

export default function ProtectedPage({
  user,
  email,
  data
}: {
  user: User;
  email: string;
  data: any;
}) {
  return (
    <>
      <div>Protected content for {email}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withAuthRequired({
  redirectTo: '/',
  async getServerSideProps(ctx) {
    // access the user object
    const user = await getUser(ctx);
    // Run queries with RLS on the server
    const { data } = await setServerAuth(supabase, ctx)
      .from('test')
      .select('*');
    return { props: { email: user!.email, data } };
  }
});

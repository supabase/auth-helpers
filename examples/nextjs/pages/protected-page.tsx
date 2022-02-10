// pages/protected-page.js
import {
  withAuthRequired,
  getUser,
  setServerAuth,
  User,
  supabaseClient
} from '@supabase/supabase-auth-helpers/nextjs';
import { useEffect } from 'react';

export default function ProtectedPage({
  user,
  email,
  data
}: {
  user: User;
  email: string;
  data: any;
}) {
  useEffect(() => {
    async function init() {
      await supabaseClient.from('test').select('*');
    }
    init();
  }, []);
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
    const { data } = await setServerAuth(supabaseClient, ctx)
      .from('test')
      .select('*');
    return { props: { email: user!.email, data } };
  }
});

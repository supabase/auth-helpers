// pages/protected-page.js
import {
  User,
  withAuthRequired,
  supabaseServerClient
} from '@supabase/supabase-auth-helpers/nextjs';
import Link from 'next/link';

export default function ProtectedPage({
  user,
  data
}: {
  user: User;
  data: any;
}) {
  return (
    <>
      <p>
        [<Link href="/">Home</Link>] | [
        <Link href="/profile">withAuthRequired</Link>]
      </p>
      <div>Protected content for {user.email}</div>
      <p>server-side fetched data with RLS:</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withAuthRequired({
  redirectTo: '/',
  async getServerSideProps(ctx) {
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient(ctx).from('test').select('*');
    return { props: { data } };
  }
});

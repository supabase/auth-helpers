// pages/protected-page.js
import {
  User,
  withPageAuth,
  supabaseServerClient
} from '@supabase/supabase-auth-helpers/nextjs';
import Link from 'next/link';

export default function ProtectedPage({
  user,
  data,
  error
}: {
  user: User;
  data: any;
  error: string;
}) {
  return (
    <>
      <p>
        [<Link href="/">Home</Link>] | [
        <Link href="/profile">withPageAuth</Link>]
      </p>
      <div>Protected content for {user.email}</div>
      <p>server-side fetched data with RLS:</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <p>{error}</p>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/',
  async getServerSideProps(ctx) {
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient(ctx).from('test').select('*');
    return { props: { data } };
  }
});

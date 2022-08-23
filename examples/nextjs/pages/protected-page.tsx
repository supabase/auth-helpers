// pages/protected-page.js
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { useSessionContext } from '@supabase/auth-helpers-react';
import Link from 'next/link';

export default function ProtectedPage({ data }: { data: any }) {
  const { error, session } = useSessionContext();
  const user = session?.user;

  return (
    <>
      <p>
        [<Link href="/">Home</Link>] | [
        <Link href="/profile">withPageAuth</Link>]
      </p>
      <div>Protected content for {user?.email}</div>
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
  async getServerSideProps(ctx, supabase) {
    // Run queries with RLS on the server
    const { data } = await supabase.from('test').select('*');

    return { props: { data } };
  }
});

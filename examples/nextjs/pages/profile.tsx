// pages/profile.js
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { useSessionContext } from '@supabase/auth-helpers-react';
import Link from 'next/link';

export default function Profile() {
  const { error, session } = useSessionContext();

  if (session?.user) {
    const { user } = session;

    return (
      <>
        <p>
          [<Link href="/">Home</Link>] | [
          <Link href="/protected-page">supabaseServerClient</Link>]
        </p>
        <div>Hello {user.email}</div>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </>
    );
  }

  return <p>{error}</p>;
}

export const getServerSideProps = withPageAuth({ authRequired: false });

// pages/profile.js
import { withPageAuth, User } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function Profile({
  user,
  error
}: {
  user: User;
  error: string;
}) {
  if (user)
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
  return <p>{error}</p>;
}

export const getServerSideProps = withPageAuth({ authRequired: false });

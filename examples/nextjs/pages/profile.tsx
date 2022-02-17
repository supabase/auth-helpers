// pages/profile.js
import { withAuthRequired, User } from '@supabase/supabase-auth-helpers/nextjs';
import { useUser } from '@supabase/supabase-auth-helpers/react';
import Link from 'next/link';

export default function Profile({ user }: { user: User }) {
  const { onUserLoadedData } = useUser();
  return (
    <>
      <p>
        [<Link href="/">Home</Link>] | [
        <Link href="/protected-page">supabaseServerClient</Link>]
      </p>
      <div>Hello {user.email}</div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <pre>{JSON.stringify(onUserLoadedData, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withAuthRequired();

import { useUser, Auth } from '@supabase/supabase-auth-helpers/react';
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import type { NextPage } from 'next';
import Link from 'next/link';

const LoginPage: NextPage = () => {
  const { user, data, error } = useUser();

  if (!user)
    return (
      <>
        {error && <p>{error.message}</p>}
        <Auth
          // view="update_password"
          supabaseClient={supabaseClient}
          providers={['google', 'github']}
          socialLayout="horizontal"
          socialButtonSize="xlarge"
        />
      </>
    );

  return (
    <>
      <p>
        [<Link href="/profile">withAuthRequired</Link>] | [
        <Link href="/protected-page">supabaseServerClient</Link>]
      </p>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>client-side data fetching with RLS</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

export default LoginPage;

import { useUser, Auth } from '@supabase/supabase-auth-helpers/react';
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const { user, error } = useUser();

  if (!user)
    return (
      <>
        {error && <p>{error.message}</p>}
        <Auth
          supabaseClient={supabaseClient}
          providers={['google', 'github']}
          socialLayout="horizontal"
          socialButtonSize="xlarge"
        />
      </>
    );

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
};

export default Home;

import { useUser, Auth } from '@supabase/supabase-auth-helpers/react';
import type { NextPage } from 'next';
import { supabase } from '../utils/initSupabase';

const Home: NextPage = () => {
  const { user, error } = useUser();

  if (!user)
    return (
      <>
        {error && <p>{error.message}</p>}
        <Auth
          supabaseClient={supabase}
          providers={['google', 'github']}
          socialLayout="horizontal"
          socialButtonSize="xlarge"
        />
      </>
    );

  return (
    <>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
};

export default Home;

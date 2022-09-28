import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const LoginPage: NextPage = () => {
  const { isLoading, session, error, supabaseClient } = useSessionContext();

  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from('test').select('*').single();
      setData(data);
    }

    loadData();
  }, [supabaseClient]);

  if (!session)
    return (
      <>
        {error && <p>{error.message}</p>}
        {isLoading ? <h1>Loading...</h1> : <h1>Loaded!</h1>}
        <button
          onClick={() => {
            supabaseClient.auth.signInWithOAuth({
              provider: 'github',
              options: { scopes: 'repo', redirectTo: 'http://localhost:3000' }
            });
          }}
        >
          GitHub with scopes
        </button>
        <Auth
          redirectTo="http://localhost:3000/"
          appearance={{ theme: ThemeSupa }}
          // view="update_password"
          supabaseClient={supabaseClient}
          providers={['google', 'github']}
          // scopes={{github: 'repo'}} // TODO: enable scopes in Auth component.
          socialLayout="horizontal"
        />
      </>
    );

  return (
    <>
      <p>
        [<Link href="/profile">withPageAuth</Link>] | [
        <Link href="/protected-page">supabaseServerClient</Link>] |{' '}
        <button
          onClick={() =>
            supabaseClient.auth.updateUser({ data: { test5: 'updated' } })
          }
        >
          Update
        </button>
      </p>
      {isLoading ? <h1>Loading...</h1> : <h1>Loaded!</h1>}
      <p>user:</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <p>client-side data fetching with RLS</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

export default LoginPage;

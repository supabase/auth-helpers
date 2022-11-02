import { useEffect, useState } from 'react';
import { json, LoaderFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate
} from '@remix-run/react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import {
  createServerClient,
  createBrowserClient,
  SupabaseClient,
  Session
} from '@supabase/auth-helpers-remix';
import { Database } from '../db_types';

export type ContextType = {
  supabase: SupabaseClient<Database> | null;
  session: Session | null;
};

type LoaderData = {
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string };
  initialSession: Session | null;
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1'
});

export const loader: LoaderFunction = async ({ request }) => {
  // environment variables may be stored somewhere other than
  // `process.env` in runtimes other than node
  // we need to pipe these Supabase environment variables to the browser
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  // We can retrieve the session on the server and hand it to the client.
  // This is used to make sure the session is available immediately upon rendering
  const response = new Response();
  const supabaseClient = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const {
    data: { session: initialSession }
  } = await supabaseClient.auth.getSession();

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    {
      initialSession,
      env: {
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      }
    },
    {
      headers: response.headers
    }
  );
};

export default function App() {
  const { env, initialSession } = useLoaderData<LoaderData>();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const navigate = useNavigate();

  const context: ContextType = { supabase, session };

  useEffect(() => {
    if (!supabase) {
      const supabaseClient = createBrowserClient<Database>(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY
      );
      setSupabase(supabaseClient);
      const {
        data: { subscription }
      } = supabaseClient.auth.onAuthStateChange((_, session) =>
        setSession(session)
      );
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {session && (
          <button
            onClick={async () => {
              await supabase?.auth.signOut();
              navigate('/');
            }}
          >
            Logout
          </button>
        )}
        {supabase && !session && (
          <Auth
            redirectTo="http://localhost:3004"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabase}
            providers={['google', 'github']}
            socialLayout="horizontal"
          />
        )}
        <hr />
        <Outlet context={context} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

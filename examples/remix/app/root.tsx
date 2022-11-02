import { useEffect, useState } from 'react';
import { json, LoaderFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import {
  createBrowserClient,
  SupabaseClient,
  Session
} from '@supabase/auth-helpers-remix';
import { Database } from '../db_types';

export type ContextType = {
  supabase: SupabaseClient<Database> | null;
  session: Session | null;
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1'
});

export const loader: LoaderFunction = () => {
  // environment variables may be stored somewhere other than
  // `process.env` in runtimes other than node
  // we need to pipe these Supabase environment variables to the browser
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  return json({
    env: {
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    }
  });
};

export default function App() {
  const { env } = useLoaderData();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const context: ContextType = { supabase, session };

  useEffect(() => {
    if (!supabase) {
      const supabaseClient = createBrowserClient<Database>(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY
      );
      setSupabase(supabaseClient);
      supabaseClient.auth.onAuthStateChange((_, session) =>
        setSession(session)
      );
    }
  }, [supabase]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <button
          onClick={async () => {
            supabase?.auth.signOut();
          }}
        >
          Logout
        </button>
        <hr />
        {supabase && !session && (
          <Auth
            redirectTo="http://localhost:3004"
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabase}
            providers={['google', 'github']}
            socialLayout="horizontal"
          />
        )}
        <Outlet context={context} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

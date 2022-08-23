import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <button
        onClick={() => {
          supabaseClient.auth.signOut();
        }}
      >
        Logout
      </button>

      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;

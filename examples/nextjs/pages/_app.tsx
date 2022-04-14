import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/auth-helpers/react';
import { supabaseClient } from '@supabase/auth-helpers/nextjs';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <a href="/api/auth/logout">Logout</a>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

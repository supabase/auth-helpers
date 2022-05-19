import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <Link href="/api/auth/logout">
        <a>Logout</a>
      </Link>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

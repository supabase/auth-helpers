import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useUser } from '@supabase/ui/dist/cjs/components/Auth/UserContext';

function MyApp({ Component, pageProps }: AppProps) {
  const { user } = useUser()
  return (
    <UserProvider supabaseClient={supabaseClient}>
      {user && <Link href="/api/auth/logout">
        Logout
      </Link>}
      {!user && <Link href="/">
        Sign in
      </Link>}
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

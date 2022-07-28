import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { Login } from '../components/Login';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <Login />
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

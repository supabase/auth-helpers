import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import { supabase } from '../utils/initSupabase';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

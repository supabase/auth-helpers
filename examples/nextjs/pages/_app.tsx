import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import {
  supabaseClient,
  SupabaseClient
} from '@supabase/supabase-auth-helpers/nextjs';

// You can pass an onUserLoaded method to fetch additional data from your public schema.
// This data will be available as the `data` prop in the `useUser` hook.
async function onUserLoaded(supabaseClient: SupabaseClient) {
  const { data } = await supabaseClient
    .from<{ name: string }>('test')
    .select('name');
  return data ? data[0] : null;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider supabaseClient={supabaseClient} onUserLoaded={onUserLoaded}>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

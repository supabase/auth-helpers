import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import {
  supabaseClient,
  SupabaseClient
} from '@supabase/supabase-auth-helpers/nextjs';

// You can pass an onUserLoaded method to fetch additional data from your public scema.
// This data will be available as the `onUserLoadedData` prop in the `useUser` hook.
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider
      supabaseClient={supabaseClient}
      onUserLoaded={async (supabaseClient) =>
        (await supabaseClient.from('test').select('*').single()).data
      }
    >
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;

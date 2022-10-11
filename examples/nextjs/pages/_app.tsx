import { useRouter } from 'next/router';
import {
  SessionContextProvider,
  useSupabaseClient
} from '../utils/sessionContext';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  return (
    <SessionContextProvider initialSession={pageProps.initialSession}>
      <button
        onClick={async () => {
          await supabaseClient.auth.signOut();
          router.push('/');
        }}
      >
        Logout
      </button>

      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;

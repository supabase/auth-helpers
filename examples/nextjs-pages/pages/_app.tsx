import { useRouter } from 'next/router';
import { createPagesBrowserClient, Session } from '@supabase/auth-helpers-nextjs';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps<{ initialSession: Session }>) {
	const router = useRouter();
	const supabase = createPagesBrowserClient<Database>();

	return (
		<>
			<button
				onClick={async () => {
					await supabase.auth.signOut();
					router.push('/');
				}}
			>
				Logout
			</button>

			<Component {...pageProps} />
		</>
	);
}

export default MyApp;

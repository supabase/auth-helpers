import {
	Session,
	createPagesBrowserClient,
	createPagesServerClient
} from '@/../../packages/nextjs/dist';
import type { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Login({ user, session }: { user: User | null; session: Session | null }) {
	const supabase = createPagesBrowserClient<Database>();

	const [data, setData] = useState<any>(null);

	useEffect(() => {
		async function loadData() {
			const { data } = await supabase.from('users').select('*').single();
			setData(data);
		}

		if (user) loadData();
	}, [user, supabase]);

	return session ? (
		<>
			<p>
				[<Link href="/profile">getServerSideProps</Link>] | [
				<Link href="/protected-page">server-side RLS</Link>] |{' '}
				<button onClick={() => supabase.auth.updateUser({ data: { test1: 'updated' } })}>
					Update user metadata
				</button>
				<button onClick={() => supabase.auth.refreshSession()}>Refresh session</button>
			</p>
			<p>user:</p>
			<pre>{JSON.stringify(session, null, 2)}</pre>
			<p>client-side data fetching with RLS</p>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</>
	) : (
		<button
			onClick={() => {
				supabase.auth.signInWithOAuth({
					provider: 'github',
					options: {
						scopes: 'repo',
						redirectTo: 'http://localhost:3000/api/callback'
					}
				});
			}}
		>
			Login with github
		</button>
	);
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const supabase = createPagesServerClient<Database>(ctx);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return {
		props: {
			session,
			user: session?.user ?? null
		}
	};
};

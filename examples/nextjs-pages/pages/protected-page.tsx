import { createPagesServerClient, User } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';

export default function ProtectedPage({ user, data }: { user: User; data: any }) {
	return (
		<>
			<p>
				[<Link href="/">Home</Link>] | [<Link href="/profile">getServerSideProps</Link>]
			</p>
			<div>Protected content for {user?.email}</div>
			<p>server-side fetched data with RLS:</p>
			<pre>{JSON.stringify(data, null, 2)}</pre>
			<p>user:</p>
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</>
	);
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	// Create authenticated Supabase Client
	const supabase = createPagesServerClient<Database>(ctx);
	// Check if we have a session
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session)
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		};

	// Run queries with RLS on the server
	const { data } = await supabase.from('users').select('*');

	return {
		props: {
			initialSession: session,
			user: session.user,
			data: data ?? []
		}
	};
};

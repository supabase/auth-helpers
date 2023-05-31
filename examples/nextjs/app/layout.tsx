import Login from './login';
import './globals.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const supabase = createServerComponentClient<Database>({ cookies });

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return (
		<html lang="en">
			{/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
			<head />
			<body>
				{/*
					`session` must be fetched in Server Component to make it available
					for the first SSR render of the Client Component - <Login />
				*/}
				<Login session={session} />
				{children}
			</body>
		</html>
	);
}

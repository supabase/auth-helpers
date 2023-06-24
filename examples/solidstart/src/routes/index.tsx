import { Navigate, useRouteData } from 'solid-start';
import { A } from '@solidjs/router';
import { createServerData$ } from 'solid-start/server';
import { type Session } from '@supabase/supabase-js';
import { getUserSession } from '~/db/session.ts';

export function routeData() {
	return createServerData$(async (_, event) => {
		const sessionJSON = await getUserSession(event.request);
		const session = await sessionJSON.json();
		return session;
	});
}

export default function Home() {
	const session = useRouteData<Session>();

	if (session()?.user) {
		return <Navigate href="/app" />;
	}

	return (
		<>
			<nav>
				<A href="/signin">Sign In</A>
			</nav>

			<main>
				<h1>Home</h1>
				<p>This is the home page...</p>
			</main>
		</>
	);
}

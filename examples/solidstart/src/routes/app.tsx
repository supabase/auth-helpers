import { Show } from 'solid-js';
import { useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { getUserSession, signOut } from '~/db/session';

export function routeData() {
	return createServerData$(async (_, event) => {
		const session = await getUserSession(event.request);

		if (!session) {
			throw redirect('/');
		}

		return session;
	});
}

export default function Protected() {
	const session = useRouteData<typeof routeData>();

	console.log('session', session());

	return (
		<Show when={session()} keyed>
			{(us) => (
				<div>
					<header>
						<button onClick={signOut}>Sign Out</button>
					</header>

					<main>
						<span>Hey there! You are signed in!</span>
					</main>
				</div>
			)}
		</Show>
	);
}

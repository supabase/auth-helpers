import { Show } from 'solid-js';
import { createRouteAction } from 'solid-start';
import { signInWithMagicLink, signInWithProvider } from '~/db/session';

export default function Signin() {
	const [magicLink, handleMagicLink] = createRouteAction(async (e: Event) => {
		const target = e.target as HTMLFormElement;
		e.preventDefault();
		return signInWithMagicLink(target.email.value);
	});

	const [provider, handleProvider] = createRouteAction(async (e: Event) => {
		const target = e.target as HTMLFormElement;
		e.preventDefault();
		return signInWithProvider(target.intent.value);
	});

	return (
		<>
			<h1>Welcome Back!</h1>
			<p>It's so good to see you again.</p>

			<div>
				<Show when={magicLink.error}>
					<div>
						<span>Something went wrong: {magicLink.error.message}</span>
					</div>
				</Show>

				<form onSubmit={handleMagicLink}>
					<label html-for="email">Email</label>
					<input type="hidden" name="intent" value="magicLink" />
					<input type="tel" id="email" name="email" />
					<button disabled={magicLink.pending} type="submit">
						Sign in
					</button>
				</form>
			</div>

			<br />

			<form onSubmit={handleProvider}>
				<input type="hidden" name="intent" value="google" />
				<button disabled={provider.pending} type="submit">
					Sign in with Google
				</button>
			</form>

			<br />

			<form onSubmit={handleProvider}>
				<input type="hidden" name="intent" value="discord" />
				<button disabled={provider.pending} type="submit">
					Sign in with Discord
				</button>
			</form>
		</>
	);
}

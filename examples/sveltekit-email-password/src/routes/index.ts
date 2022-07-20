import type { RequestHandler } from './__types/index';
import { supabaseClient } from '$lib/db';

export async function GET({ locals }: { locals: App.Locals }) {
	if (locals.user) {
		return {
			status: 303,
			headers: {
				location: '/dashboard'
			}
		};
	}
	return {
		status: 200
	};
}

export async function POST({ request }: { request: Request }) {
	const data = await request.formData();

	const email = data.get('email') as string;
	const password = data.get('password') as string;

	const headers = { location: '/dashboard' };
	const errors: Record<string, string> = {};
	const values: Record<string, string> = { email, password };

	const { session, error } = await supabaseClient.auth.signIn({ email, password });

	if (error) {
		errors.form = error.message;
		return {
			status: 400,
			body: {
				errors,
				values
			}
		};
	}

	if (session) {
		const response = await fetch('http://localhost:3002/api/auth/callback', {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
			body: JSON.stringify({ event: 'SIGNED_IN', session })
		});

		// TODO: Add helper inside of auth-helpers-sveltekit library to manage this better
		const cookies = response.headers
			.get('set-cookie')
			.split('SameSite=Lax, ')
			.map((cookie) => {
				if (!cookie.includes('SameSite=Lax')) {
					cookie += 'SameSite=Lax';
				}
				return cookie;
			});
		headers['Set-Cookie'] = cookies;
	}
	return {
		status: 303,
		headers
	};
}

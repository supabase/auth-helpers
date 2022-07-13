import { supabaseClient } from '$lib/db';

export async function get({ locals }: { locals: App.Locals }) {
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

export async function post({ request }: { request: Request }) {
	const data = await request.formData();

	const email = data.get('email') as string;

	const errors: Record<string, string> = {};
	const values: Record<string, string> = { email };

	const { error } = await supabaseClient.auth.signIn(
		{ email },
		{ redirectTo: 'http://localhost:3004/logging-in' }
	);

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

	return {
		status: 200,
		body: {
			message: 'Please check your email for a magic link to log into the website.'
		}
	};
}

import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase }, request }) => {
	const code = url.searchParams.get('code');

	console.log([code, request.headers.get('cookie')]);

	if (code) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	throw redirect(303, '/');
};

import { handleUser, handleCallback } from '@supabase/auth-helpers-sveltekit';
import type { GetSession, Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const handle: Handle = sequence(handleCallback(), handleUser());

export const getSession: GetSession = async (event) => {
	const { user, accessToken } = event.locals;
	return {
		user,
		accessToken
	};
};

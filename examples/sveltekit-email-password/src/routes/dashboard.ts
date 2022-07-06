import { supabaseServerClient, withApiAuth } from '@supabase/auth-helpers-sveltekit';

export const get = async ({ locals, request }) =>
	withApiAuth(
		{
			redirectTo: '/',
			user: locals.user
		},
		async () => {
			const { data } = await supabaseServerClient(request).from('test').select('*');
			return {
				body: {
					data,
					user: locals.user
				}
			};
		}
	);

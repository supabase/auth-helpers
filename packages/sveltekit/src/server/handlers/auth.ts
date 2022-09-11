import { sequence } from '@sveltejs/kit/hooks';
// import callback from './callback';
import session from './session';
import type { SupabaseClient } from '@supabase/supabase-js';
import { setServerConfig } from '../config';
import { COOKIE_OPTIONS, ENDPOINT_PREFIX, TOKEN_REFRESH_MARGIN } from '../../constants';
import type { CookieOptions } from '../../types';
import type { Handle } from '@sveltejs/kit';
import { setClientConfig } from '../../config';

interface Options {
	supabaseClient: SupabaseClient;
	tokenRefreshMargin?: number;
	cookieName?: string;
	cookieOptions?: CookieOptions;
	endpointPrefix?: string;
}

export default function auth({
	supabaseClient,
	cookieName = 'sb',
	cookieOptions = {},
	tokenRefreshMargin = TOKEN_REFRESH_MARGIN,
	endpointPrefix = ENDPOINT_PREFIX
}: Options): Handle {
	setClientConfig({
		supabaseClient,
		tokenRefreshMargin,
		endpointPrefix
	});
	setServerConfig({
		supabaseClient,
		cookieName,
		cookieOptions: { ...COOKIE_OPTIONS, ...cookieOptions },
		tokenRefreshMargin,
		endpointPrefix
	});

	return sequence(
		// callback(),
		session()
	);
}

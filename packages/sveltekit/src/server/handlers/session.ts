import type { Handle, RequestEvent } from '@sveltejs/kit';
import { decodeJwt } from 'jose';
import type { User } from '@supabase/supabase-js';
import { getServerConfig } from '../config';
import { saveSession } from '../helpers';

export async function attachSession(event: RequestEvent) {
	const { supabaseClient, cookieName, tokenRefreshMargin } = getServerConfig();

	const { cookies, locals } = event;
	try {
		const accessToken = cookies.get(`${cookieName}-access-token`);

		if (!accessToken) {
			throw 'AccessTokenNotFound';
		}

		const jwt = decodeJwt(accessToken);

		if (!jwt.exp) {
			throw 'JWTPayloadFailed';
		}

		const timeNow = Math.round(Date.now() / 1000);

		if (jwt.exp < timeNow + tokenRefreshMargin) {
			const refreshToken = cookies.get(`${cookieName}-refresh-token`);
			if (!refreshToken) {
				throw 'RefreshTokenNotFound';
			}
			const { data, error } = await supabaseClient.auth.api.refreshAccessToken(refreshToken);
			if (error || !data) {
				throw error;
			}
			saveSession(cookies, data);
			locals.user = { ...data.user, exp: data.expires_at } as User;
			locals.accessToken = accessToken;
		} else {
			const { data } = await supabaseClient.auth.api.getUser(accessToken);
			locals.user = { ...data, exp: jwt.exp } as User;
			locals.accessToken = accessToken;
		}
	} catch (err) {
		locals.accessToken = null;
		locals.user = null;
	}
}

export default function session(): Handle {
	return async ({ resolve, event }) => {
		await attachSession(event);
		return resolve(event);
	};
}

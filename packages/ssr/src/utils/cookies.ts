import { Session } from '@supabase/supabase-js';
import { parse, serialize } from 'cookie';
import { base64url } from 'jose';

export { parse as parseCookies, serialize as serializeCookie };

export function parseSupabaseCookie(str: string | null | undefined): Partial<Session> | null {
	if (!str) {
		return null;
	}

	try {
		const session = JSON.parse(str);
		if (!session) {
			return null;
		}
		// Support previous cookie which was a stringified session object.
		if (session.constructor.name === 'Object') {
			return session;
		}
		if (session.constructor.name !== 'Array') {
			throw new Error(`Unexpected format: ${session.constructor.name}`);
		}

		const [_header, payloadStr, _signature] = session[0].split('.');
		const payload = base64url.decode(payloadStr);
		const decoder = new TextDecoder();

		const { exp, sub, ...user } = JSON.parse(decoder.decode(payload));

		return {
			expires_at: exp,
			expires_in: exp - Math.round(Date.now() / 1000),
			token_type: 'bearer',
			access_token: session[0],
			refresh_token: session[1],
			provider_token: session[2],
			provider_refresh_token: session[3],
			user: {
				id: sub,
				factors: session[4],
				...user
			}
		};
	} catch (err) {
		console.warn('Failed to parse cookie string:', err);
		return null;
	}
}

export function stringifySupabaseSession(session: Session): string {
	return JSON.stringify([
		session.access_token,
		session.refresh_token,
		session.provider_token,
		session.provider_refresh_token,
		session.user?.factors ?? null
	]);
}

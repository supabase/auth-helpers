import {
  parseSupabaseCookie,
  stringifySupabaseSession
} from '@supabase/auth-helpers-shared';
import { error, Handle, Cookies } from '@sveltejs/kit';

export function supabaseAuth({
  path = '/api/supabase',
  cookieName = 'sb-auth-token',
  cookieOptions
}: {
  path?: string;
  cookieName?: string;
  cookieOptions?: Parameters<Cookies['serialize']>[2];
} = {}): Handle {
  cookieOptions = {
    path: '/',
    ...cookieOptions
  };

  return async ({ event, resolve }) => {
    if (event.url.pathname !== path) {
      return resolve(event, {
        filterSerializedResponseHeaders(name) {
          return name === 'content-range';
        }
      });
    }

    try {
      if (event.request.method === 'GET') {
        const sessionStr = event.cookies.get(cookieName);
        if (!sessionStr) {
          return new Response(null, {
            status: 200,
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
        }
        const session = parseSupabaseCookie(sessionStr);

        return new Response(JSON.stringify(session), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
      }
      if (event.request.method === 'POST') {
        const session = await event.request.json();
        const sessionStr = stringifySupabaseSession(session);
        return new Response(null, {
          status: 204,
          headers: {
            'Cache-Control': 'no-cache',
            'set-cookie': event.cookies.serialize(
              cookieName,
              sessionStr,
              cookieOptions
            )
          }
        });
      }
      if (event.request.method === 'DELETE') {
        return new Response(null, {
          status: 204,
          headers: {
            'Cache-Control': 'no-cache',
            'set-cookie': event.cookies.serialize(cookieName, '', {
              ...cookieOptions,
              maxAge: 0,
              expires: new Date()
            })
          }
        });
      }

      return new Response(null, {
        status: 405,
        statusText: 'Method Not Allowed'
      });
    } catch (err) {
      throw error(500, {
        message: 'SupabaseAuth Error'
      });
    }
  };
}

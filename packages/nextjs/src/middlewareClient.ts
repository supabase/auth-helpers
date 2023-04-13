import {
  CookieAuthStorageAdapter,
  CookieOptions,
  CookieOptionsWithName,
  createSupabaseClient,
  parseCookies,
  serializeCookie,
  SupabaseClientOptionsWithoutAuth
} from '@supabase/auth-helpers-shared';
import { NextRequest, NextResponse } from 'next/server';

class NextMiddlewareAuthStorageAdapter extends CookieAuthStorageAdapter {
  constructor(
    private readonly context: { req: NextRequest; res: NextResponse },
    cookieOptions?: CookieOptions
  ) {
    super(cookieOptions);
  }

  protected getCookie(name: string): string | null | undefined {
    const cookies = parseCookies(this.context.req.headers.get('cookie') ?? '');
    return cookies[name];
  }
  protected setCookie(name: string, value: string): void {
    this._setCookie(name, value);
  }
  protected deleteCookie(name: string): void {
    this._setCookie(name, '', {
      maxAge: 0
    });
  }

  private _setCookie(name: string, value: string, options?: CookieOptions) {
    const newSessionStr = serializeCookie(name, value, {
      ...this.cookieOptions,
      ...options,
      // Allow supabase-js on the client to read the cookie as well
      httpOnly: false
    });

    this.context.req.headers.append('cookie', newSessionStr);
    this.context.res.headers.set('set-cookie', newSessionStr);
  }
}

export function createMiddlewareSupabaseClient<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database
>(
  context: { req: NextRequest; res: NextResponse },
  {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
    cookieOptions
  }: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
  } = {}
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
    );
  }

  return createSupabaseClient<Database, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
      }
    },
    auth: {
      storageKey: cookieOptions?.name,
      storage: new NextMiddlewareAuthStorageAdapter(context, cookieOptions)
    }
  });
}

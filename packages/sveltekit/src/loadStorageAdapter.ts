import {
  BrowserCookieAuthStorageAdapter,
  CookieOptions,
  isBrowser
} from '@supabase/auth-helpers-shared';
import { Session } from '@supabase/supabase-js';

export class SvelteKitLoadAuthStorageAdapter extends BrowserCookieAuthStorageAdapter {
  constructor(
    private readonly serverSession: Session | null = null,
    cookieOptions?: CookieOptions
  ) {
    super(cookieOptions);
  }

  getItem(key: string) {
    if (!isBrowser()) {
      return JSON.stringify(this.serverSession);
    }
    return super.getItem(key);
  }
}

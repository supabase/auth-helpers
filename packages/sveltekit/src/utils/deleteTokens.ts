import { setCookies, SvelteKitRequestAdapter, SvelteKitResponseAdapter } from "@supabase/auth-helpers-shared";
import type { RequestResponse } from '../types';

export function deleteTokens({ req, res }: RequestResponse, cookieName: string) {
  setCookies(
    new SvelteKitRequestAdapter(req),
    new SvelteKitResponseAdapter(res),
    ['access-token', 'refresh-token', 'provider-token'].map((key) => ({
      name: `${cookieName}-${key}`,
      value: '',
      maxAge: -1
    }))
  );
}
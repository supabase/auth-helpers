import type { CookieSerializeOptions } from 'cookie';

export type CookieOptions = Partial<CookieSerializeOptions>;
export type CookieOptionsWithName = { name?: string } & CookieOptions;

export type GetCookie = (
	name: string
) => Promise<string | null | undefined> | string | null | undefined;

export type SetCookie = (
	name: string,
	value: string,
	options: CookieOptions
) => Promise<void> | void;
export type RemoveCookie = (name: string) => Promise<void> | void;

export type GetAllCookies = () =>
	| Promise<{ name: string; value: string }[] | null>
	| { name: string; value: string }[]
	| null;

export type SetAllCookies = (
	cookies: { name: string; value: string; options: CookieOptions }[]
) => Promise<void> | void;

/**
 * Methods that allow access to cookies in browser-like environments.
 */
export type CookieMethodsBrowser =
	| {
			/** @deprecated Move to using `getAll` instead. */
			get: GetCookie;
			/** @deprecated Move to using `getAll` instead. */
			set: SetCookie;
			/** @deprecated Move to using `getAll` instead. */
			remove: RemoveCookie;
	  }
	| { getAll: GetAllCookies; setAll: SetAllCookies };

/**
 * Methods that allow access to cookies in server-side rendering environments.
 */
export type CookieMethods =
	| {
			/**
			 * @deprecated Move to using `getAll` instead.
			 */
			get: GetCookie;

			/**
			 * @deprecated Move to using `setAll` instead.
			 *
			 * Optional in certain cases only! Please read the docs on `setAll`.
			 * */
			set?: SetCookie;

			/**
			 * @deprecated Move to using `setAll` instead.
			 *
			 * Optional in certain cases only! Please read the docs on `setAll`.
			 * */
			remove?: RemoveCookie;
	  }
	| {
			/**
			 * Returns all cookies associated with the request in which the server-side client is operating. Typically (but not always) this is called only once per request / client instance. In any case, repeated calls of this function should reflect any changes done to cookies if setAll was called.
			 */
			getAll: GetAllCookies;

			/**
			 * Optional in certain cases only! Make sure you implement this method whenever possible, and omit it only in cases where the server-side client is unable to set or manipulate cookies. One common example for this is NextJS server components.
			 *
			 * Failing to provide an implementation can result in difficult to debug behavior such as:
			 * - Random logouts, or early session termination
			 * - Increased number of API calls on the `.../token?grant_type=refres_token` endpoint
			 */
			setAll?: SetAllCookies;
	  };

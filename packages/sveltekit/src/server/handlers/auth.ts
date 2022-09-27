import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { callback } from './callback.js';
import { session } from './session.js';

/**
 * All in one handler.
 *
 * Shorthand to
 * ```ts
 * sequence(callback(), session())
 * ```
 *
 * @example
 * // src/hooks.server.ts
 * export const handle = auth();
 * export const handle = sequence(auth(), ...);
 */
export function auth(): Handle {
  return sequence(callback(), session());
}

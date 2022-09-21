import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { callback } from './callback';
import { session } from './session';

export function auth(): Handle {
  return sequence(callback(), session());
}

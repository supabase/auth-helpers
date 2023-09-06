export { parse, serialize } from 'cookie';

export function isBrowser() {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

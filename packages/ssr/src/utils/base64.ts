const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodeBase64Url(str: string): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(str).toString('base64url');
	}
	const bytes = Array.from(encoder.encode(str), (x) => String.fromCodePoint(x)).join('');
	return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBase64Url(str: string | undefined): string | undefined {
	if (str == null) {
		return str;
	}
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(str, 'base64url').toString();
	}
	const bytes = Uint8Array.from(atob(str), (x) => x.codePointAt(0)!);
	return decoder.decode(bytes);
}

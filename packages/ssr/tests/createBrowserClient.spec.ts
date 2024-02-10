import { describe, expect, it, vi } from 'vitest';
import { createBrowserClient } from '../src/createBrowserClient';

describe('createBrowserClient', () => {
	it('should throw an error when required parameters are not provided', () => {
		// @ts-expect-error
		expect(() => createBrowserClient()).toThrowError(/URL and Key/);
	});

	it('should throw an error when the provided URL is not a well-formed http address', () => {
		expect(() => createBrowserClient('test', 'test')).toThrow(/Invalid URL/);
	});

	it('should use cookie methods provided as options when creating a client', async () => {
		const cookies = {
			get(_key: string) {
				return '';
			}
		};

		const getCookieSpy = vi.spyOn(cookies, 'get');

		const client = createBrowserClient('https://test.com', 'test', {
			cookies
		});

		// The client accesses cookies while retrieving the session
		await client.auth.getSession();

		expect(getCookieSpy).toHaveBeenCalledWith('sb-test-auth-token');
	});
});

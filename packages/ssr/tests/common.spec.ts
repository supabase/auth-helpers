import { describe, expect, it } from 'vitest';

import { createStorageFromOptions } from '../src/common';

describe('createStorageFromOptions for createServerClient', () => {
	describe('storage with getAll, setAll', () => {
		it('should not call setAll on setItem', async () => {
			let setAllCalled = false;

			const { storage, setItems, removedItems } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						return [];
					},

					setAll: async () => {
						setAllCalled = true;
					}
				}
			});

			await storage.setItem('storage-key', 'value');

			expect(setAllCalled).toBeFalsy();
			expect(setItems).toEqual({ 'storage-key': 'value' });
			expect(removedItems).toEqual({});
		});

		it('should not call setAll on removeItem', async () => {
			let setAllCalled = false;

			const { storage, setItems, removedItems } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						return [];
					},

					setAll: async () => {
						setAllCalled = true;
					}
				}
			});

			await storage.removeItem('storage-key');

			expect(setAllCalled).toBeFalsy();
			expect(setItems).toEqual({});
			expect(removedItems).toEqual({ 'storage-key': true });
		});

		it('should not call getAll if item has already been set', async () => {
			let getAllCalled = false;

			const { storage } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						getAllCalled = true;

						return [];
					},

					setAll: async () => {}
				}
			});

			await storage.setItem('storage-key', 'value');

			const value = await storage.getItem('storage-key');

			expect(value).toEqual('value');
			expect(getAllCalled).toBeFalsy();
		});

		it('should not call getAll if item has already been removed', async () => {
			let getAllCalled = false;

			const { storage } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						getAllCalled = true;

						return [];
					},

					setAll: async () => {}
				}
			});

			await storage.removeItem('storage-key');

			const value = await storage.getItem('storage-key');

			expect(value).toBeNull();
			expect(getAllCalled).toBeFalsy();
		});

		it('should call getAll each time getItem is called until setItem or removeItem', async () => {
			let getAllCalled = 0;

			const { storage } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						getAllCalled += 1;

						return [];
					},

					setAll: async () => {}
				}
			});

			await storage.getItem('storage-key');

			expect(getAllCalled).toEqual(1);

			await storage.getItem('storage-key');

			expect(getAllCalled).toEqual(2);

			await storage.setItem('storage-key', 'value');

			await storage.getItem('storage-key');

			expect(getAllCalled).toEqual(2);
		});

		it('should return item value from getAll without chunks', async () => {
			const { storage } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						return [
							{
								name: 'storage-key',
								value: 'value'
							},
							{
								name: 'other-cookie',
								value: 'other-value'
							},
							{
								name: 'storage-key.0',
								value: 'leftover-chunk-value'
							}
						];
					},

					setAll: async () => {}
				}
			});

			const value = await storage.getItem('storage-key');

			expect(value).toEqual('value');
		});

		it('should return item value from getAll with chunks', async () => {
			const { storage } = createStorageFromOptions({
				cookies: {
					getAll: async () => {
						return [
							{
								name: 'other-cookie',
								value: 'other-value'
							},
							{
								name: 'storage-key.0',
								value: 'val'
							},
							{
								name: 'storage-key.1',
								value: 'ue'
							},
							{
								name: 'storage-key.2',
								value: ''
							},
							{
								name: 'storage-key.3',
								value: 'leftover-chunk-value'
							}
						];
					},

					setAll: async () => {}
				}
			});

			const value = await storage.getItem('storage-key');

			expect(value).toEqual('value');
		});
	});

	describe('storage with get, set, remove', () => {
		it('should call get multiple times for the storage key and its chunks', async () => {
			const getNames: string[] = [];

			const { storage } = createStorageFromOptions(
				{
					get: async (name: string) => {
						getNames.push(name);

						if (name === 'storage-key') {
							return 'value';
						}

						return null;
					},
					set: async () => {},
					remove: async () => {}
				},
				true
			);

			const value = await storage.getItem('storage-key');

			expect(value).toEqual('value');

			expect(getNames).toEqual([
				'storage-key',
				'storage-key.0',
				'storage-key.1',
				'storage-key.2',
				'storage-key.3',
				'storage-key.4'
			]);
		});

		it('should reconstruct storage value from chunks', async () => {
			const { storage } = createStorageFromOptions(
				{
					get: async (name: string) => {
						if (name === 'storage-key.0') {
							return 'val';
						}

						if (name === 'storage-key.1') {
							return 'ue';
						}

						if (name === 'storage-key.3') {
							return 'leftover-chunk-value';
						}

						return null;
					},
					set: async () => {},
					remove: async () => {}
				},
				true
			);

			const value = await storage.getItem('storage-key');

			expect(value).toEqual('value');
		});
	});

	describe('setAll when using set, remove', () => {
		it('should call set and remove depending on the values sent to setAll', async () => {
			const setCalls: { name: string; value: string }[] = [];
			const removeCalls: string[] = [];

			const { setAll } = createStorageFromOptions(
				{
					get: async (name: string) => {
						return null;
					},
					set: async (name, value, options) => {
						setCalls.push({ name, value, options });
					},
					remove: async (name) => {
						removeCalls.push(name);
					}
				},
				true
			);

			await setAll([
				{
					name: 'a',
					value: 'b',
					options: { maxAge: 10 }
				},
				{
					name: 'b',
					value: 'c',
					options: { maxAge: 10 }
				},
				{
					name: 'c',
					value: '',
					options: { maxAge: 0 }
				}
			]);

			expect(setCalls).toEqual([
				{ name: 'a', value: 'b', options: { maxAge: 10 } },
				{ name: 'b', value: 'c', options: { maxAge: 10 } }
			]);

			expect(removeCalls).toEqual('c');
		});
	});
});

describe('createStorageFromOptions for createBrowserClient', () => {
	describe('storage', () => {});
});

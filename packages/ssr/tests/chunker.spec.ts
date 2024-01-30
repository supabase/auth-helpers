import { describe, expect, it } from 'vitest';
import { combineChunks, createChunks } from '../src/utils/chunker';
import { CHUNK_STRING, DOUBLE_CHUNK_STRING, len } from './helper';

describe('chunker', () => {
	it('should not chunk and return one item', () => {
		const chunked = createChunks('my-chunks', 'hello-world');
		expect(chunked.length).toBe(1);
	});

	it('should chunk and return two chunks', async () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 2000);
		const combined = await combineChunks('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(len(`my-chunks=${CHUNK_STRING}`)).toBe(3621);
		expect(chunked.length).toBe(2);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return twelve chunks', async () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 320);
		const combined = await combineChunks('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(12);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return one hundred and one chunks', async () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 36);
		const combined = await combineChunks('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(101);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return correct size chunks', async () => {
		const key = 'sb-xdbaubpgcisziicojymj-auth-token';
		const chunked = createChunks(key, DOUBLE_CHUNK_STRING);
		const combined = await combineChunks(key, (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});

		chunked.forEach((chunk, i) => {
			expect(chunk.name).toBe(`${key}.${i}`);
			expect([3217, 3217, 899]).toContain(len(`${chunk.name}=${chunk.value}`));
		});

		expect(chunked.length).toBe(3);
		expect(len(`${key}=${DOUBLE_CHUNK_STRING}`)).toBe(7257);
		expect(combined).toBe(DOUBLE_CHUNK_STRING);
	});

	it('should correctly break between unicode boundaries in escaped characters', () => {
		const test = '   ';
		const chunks = createChunks('key', test, 4);
		expect(chunks).toEqual([
			{
				name: 'key.0',
				value: ' '
			},
			{
				name: 'key.1',
				value: ' '
			},
			{
				name: 'key.2',
				value: ' '
			}
		]);

		expect(chunks.map((char) => char.value).join('')).toEqual(test);
	});

	describe('should correctly break between unicode boundaries in long unicode', () => {
		it('should correctly break between unicode boundaries in long unicode (4 bytes)', () => {
			const test = '🤦🏻‍♂️';
			const chunksAtStartBorder = createChunks('key', test, 12);
			const chunksAtEndBorder = createChunks('key', test, 17);
			expect(chunksAtStartBorder).toEqual(chunksAtEndBorder);
			expect(chunksAtStartBorder).toEqual([
				{
					name: 'key.0',
					value: '🤦'
				},
				{
					name: 'key.1',
					value: '🏻'
				},
				{
					name: 'key.2',
					value: '‍'
				},
				{
					name: 'key.3',
					value: '♂'
				},
				{
					name: 'key.4',
					value: '️'
				}
			]);
			expect(chunksAtStartBorder.map((char) => char.value).join('')).toEqual(test);
		});

		it('should correctly break between unicode boundaries in long unicode (5 bytes)', () => {
			const test = '🤦🏻‍♂️';
			const chunksAtStartBorder = createChunks('key', test, 18);
			const chunksAtEndBorder = createChunks('key', test, 20);
			expect(chunksAtStartBorder).toEqual(chunksAtEndBorder);
			expect(chunksAtStartBorder).toEqual([
				{
					name: 'key.0',
					value: '🤦'
				},
				{
					name: 'key.1',
					value: '🏻'
				},
				{
					name: 'key.2',
					value: '‍♂'
				},
				{
					name: 'key.3',
					value: '️'
				}
			]);
			expect(chunksAtStartBorder.map((char) => char.value).join('')).toEqual(test);
		});
	});
});

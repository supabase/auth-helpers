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
		expect(len(`my-chunks=${CHUNK_STRING}`)).toBe(3921);
		expect(chunked.length).toBe(2);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return thirteen chunks', async () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 320);
		const combined = await combineChunks('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(13);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return one hundred and nine chunks', async () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 36);
		const combined = await combineChunks('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(109);
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
			expect([3837, 3837, 259]).toContain(len(`${chunk.name}=${chunk.value}`));
		});

		expect(chunked.length).toBe(3);
		expect(len(`${key}=${DOUBLE_CHUNK_STRING}`)).toBe(7857);
		expect(combined).toBe(DOUBLE_CHUNK_STRING);
	});
});

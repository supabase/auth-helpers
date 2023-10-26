import { describe, expect, it } from 'vitest';
import { combineChunk, createChunks } from '../src/chunker';
import { CHUNK_STRING } from './helper';

describe('chunker', () => {
	it('should not chunk and return one item', () => {
		const chunked = createChunks('my-chunks', 'hello-world');
		expect(chunked.length).toBe(1);
	});

	it('should chunk and return two chunks', () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 2000);
		const combined = combineChunk('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(2);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return twelve chunks', () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 320);
		const combined = combineChunk('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(12);
		expect(combined).toBe(CHUNK_STRING);
	});

	it('should chunk and return one hundred and one chunks', () => {
		const chunked = createChunks('my-chunks', CHUNK_STRING, 36);
		const combined = combineChunk('my-chunks', (name) => {
			let chunk = chunked.find((chunk) => {
				return chunk.name === name;
			});
			return chunk?.value;
		});
		expect(chunked.length).toBe(101);
		expect(combined).toBe(CHUNK_STRING);
	});
});

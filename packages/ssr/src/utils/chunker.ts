interface Chunk {
	name: string;
	value: string;
}

const MAX_CHUNK_SIZE = 3180;

/**
 * create chunks from a string and return an array of object
 */
export function createChunks(key: string, value: string, chunkSize?: number): Chunk[] {
	const resolvedChunkSize = chunkSize ?? MAX_CHUNK_SIZE;

	let encodedValue = encodeURIComponent(value);

	if (encodedValue.length <= resolvedChunkSize) {
		return [{ name: key, value }];
	}

	const chunks: string[] = [];

	while (encodedValue.length > 0) {
		let encodedChunkHead = encodedValue.slice(0, resolvedChunkSize);

		const lastEscapePos = encodedChunkHead.lastIndexOf('%');

		// Check if the last escaped character is truncated.
		if (lastEscapePos > resolvedChunkSize - 3) {
			// If so, reslice the string to exclude the whole escape sequence.
			// We only reduce the size of the string as the chunk must
			// be smaller than the chunk size.
			encodedChunkHead = encodedChunkHead.slice(0, lastEscapePos);
		}

		let valueHead: string = '';

		// Check if the chunk was split along a valid unicode boundary.
		while (encodedChunkHead.length > 0) {
			try {
				// Try to decode the chunk back and see if it is valid.
				// Stop when the chunk is valid.
				valueHead = decodeURIComponent(encodedChunkHead);
				break;
			} catch (error) {
				if (
					error instanceof URIError &&
					encodedChunkHead.at(-3) === '%' &&
					encodedChunkHead.length > 3
				) {
					encodedChunkHead = encodedChunkHead.slice(0, encodedChunkHead.length - 3);
				} else {
					throw error;
				}
			}
		}

		chunks.push(valueHead);
		encodedValue = encodedValue.slice(encodedChunkHead.length);
	}

	return chunks.map((value, i) => ({ name: `${key}.${i}`, value }));
}

// Get fully constructed chunks
export async function combineChunks(
	key: string,
	retrieveChunk: (name: string) => Promise<string | null | undefined> | string | null | undefined
) {
	const value = await retrieveChunk(key);

	if (value) {
		return value;
	}

	let values: string[] = [];

	for (let i = 0; ; i++) {
		const chunkName = `${key}.${i}`;
		const chunk = await retrieveChunk(chunkName);

		if (!chunk) {
			break;
		}

		values.push(chunk);
	}

	if (values.length > 0) {
		return values.join('');
	}
}

export async function deleteChunks(
	key: string,
	retrieveChunk: (name: string) => Promise<string | null | undefined> | string | null | undefined,
	removeChunk: (name: string) => Promise<void> | void
) {
	const value = await retrieveChunk(key);

	if (value) {
		await removeChunk(key);
	}

	for (let i = 0; ; i++) {
		const chunkName = `${key}.${i}`;
		const chunk = await retrieveChunk(chunkName);

		if (!chunk) {
			break;
		}

		await removeChunk(chunkName);
	}
}

interface Chunk {
	name: string;
	value: string;
}

function createChunkRegExp(chunkSize: number) {
	return new RegExp(`(.{1,${chunkSize}})(?=%[0-9A-Fa-f]{2}|$)`, 'g');
}

const MAX_CHUNK_SIZE = 3180;
const MAX_CHUNK_REGEXP = createChunkRegExp(MAX_CHUNK_SIZE);

/**
 * create chunks from a string and return an array of object
 */

export function createChunks(key: string, value: string, chunkSize?: number): Chunk[] {
	const re = chunkSize !== undefined ? createChunkRegExp(chunkSize) : MAX_CHUNK_REGEXP;
	const encodedValue = encodeURIComponent(value);

	if (encodedValue.length <= (chunkSize ?? MAX_CHUNK_SIZE)) {
		return [{ name: key, value }];
	}

	const encodedChunks = encodedValue.match(re) || [];

	return encodedChunks.map((chunk, index) => ({
		name: `${key}.${index}`,
		value: decodeURIComponent(chunk)
	}));
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
		return;
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

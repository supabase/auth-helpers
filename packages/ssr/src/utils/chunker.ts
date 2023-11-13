interface Chunk {
	name: string;
	value: string;
}

function createChunkRegExp(chunkSize: number): RegExp {
	return new RegExp('.{1,' + chunkSize + '}', 'g');
}

const MAX_CHUNK_SIZE = 3180;
const MAX_CHUNK_REGEXP = createChunkRegExp(MAX_CHUNK_SIZE);

/**
 * create chunks from a string and return an array of object
 */

export function createChunks(
	key: string,
	value: string,
	chunkSize: number = MAX_CHUNK_SIZE
): Chunk[] {
	// If the value is within the chunk size limit, return it as is
	if (encodeURIComponent(value).length <= chunkSize) {
		return [{ name: key, value }];
	}

	// Split the value into chunks based on the regular expression
	const re = chunkSize !== MAX_CHUNK_SIZE ? createChunkRegExp(chunkSize) : MAX_CHUNK_REGEXP;
	const initialChunks = value.match(re) || [];

	// Recursively handle chunks that are still too large
	return initialChunks.flatMap((chunk, index) => {
		return splitChunkIfNeeded(key + '.' + index, chunk, chunkSize);
	});
}

function splitChunkIfNeeded(key: string, chunk: string, chunkSize: number): Chunk[] {
	if (encodeURIComponent(chunk).length <= chunkSize) {
		return [{ name: key, value: chunk }];
	}

	// If the chunk is too large, split it into smaller chunks recursively
	const midPoint = Math.floor(chunk.length / 2);
	if (midPoint < 2) {
		// If the chunk is too small to split, return it as is
		// Maybe we should throw an error here?
		return [{ name: key, value: chunk }];
	}
	const leftChunk = chunk.substring(0, midPoint);
	const rightChunk = chunk.substring(midPoint);

	return [
		...splitChunkIfNeeded(key + '.1', leftChunk, chunkSize),
		...splitChunkIfNeeded(key + '.2', rightChunk, chunkSize)
	];
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

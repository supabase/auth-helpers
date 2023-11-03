interface Chunk {
	name: string;
	value: string;
}

function createChunkRegExp(chunkSize: number) {
	return new RegExp('.{1,' + chunkSize + '}', 'g');
}

const MAX_CHUNK_SIZE = 3600;
const MAX_CHUNK_REGEXP = createChunkRegExp(MAX_CHUNK_SIZE);

/**
 * create chunks from a string and return an array of object
 */
export function createChunks(key: string, value: string, chunkSize?: number): Chunk[] {
	const re = chunkSize !== undefined ? createChunkRegExp(chunkSize) : MAX_CHUNK_REGEXP;
	// check the length of the string to work out if it should be returned or chunked
	const chunkCount = Math.ceil(value.length / (chunkSize ?? MAX_CHUNK_SIZE));

	if (chunkCount === 1) {
		return [{ name: key, value }];
	}

	const chunks: Chunk[] = [];
	// split string into a array based on the regex
	const values = value.match(re);
	values?.forEach((value, i) => {
		const name = `${key}.${i}`;
		chunks.push({ name, value });
	});

	return chunks;
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

// No clue why, but 3600 matches 4kb in the browser
const MAX_CHUNK_SIZE = 3600;
const re = new RegExp('.{1,' + MAX_CHUNK_SIZE + '}', 'g');

interface Chunk {
	name: string;
	value: string;
}

/**
 * create chunks from a string and return an array of object
 */
export function createChunks(key: string, value: string): Chunk[] {
	// check the length of the string to work out if it should be returned or chunked
	const chunkCount = Math.ceil(value.length / MAX_CHUNK_SIZE);

	if (chunkCount === 1) {
		return [{ name: key, value }];
	}

	const chunks: Chunk[] = [];
	// split string into a array based on the regex
	const values = value.match(re);

	values?.forEach((value, i) => {
		const name: string = `${key}.${i}`;
		chunks.push({ name, value });
	});

	return chunks;
}

// Get fully constructed chunks
export function combineChunk(
	key: string,
	retrieveChunk: (name: string) => string | null | undefined = () => {
		return null;
	}
) {
	let values: string[] = [];
	for (let i = 0; ; i++) {
		const chunkName = `${key}.${i}`;
		const chunk = retrieveChunk(chunkName);

		if (!chunk) {
			break;
		}

		values.push(chunk);
	}

	return values.length ? values.join('') : null;
}

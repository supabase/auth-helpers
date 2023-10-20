// No clue why, but 3600 matches 4kb in the browser
const MAX_CHUNK_SIZE = 3600;

interface Chunk {
	name: string;
	value: string;
}

// Get cookie as chunks to set in the browser
export function createChunks(key: string, value: string) {
	// check the length and then split
	const chunkCount = Math.ceil(value.length / MAX_CHUNK_SIZE);

	if (chunkCount === 1) {
		return value;
	}

	const chunks: Chunk[] = [];
	const values = value.match(new RegExp('.{1,' + MAX_CHUNK_SIZE + '}', 'g'));

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

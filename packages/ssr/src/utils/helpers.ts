export { parse, serialize } from 'cookie';

export function isBrowser() {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

// This function is copied and adapted from ModernDash by Maximilian Dewald under the MIT License.
// Source: https://github.com/Maggi64/moderndash/blob/main/package/src/object/merge.ts#L28-L38
export function merge(target: Record<any, any>, ...sources: Record<any, any>[]) {
	const targetCopy = { ...target };
	for (const source of sources) {
		for (const [key, value] of Object.entries(source)) {
			targetCopy[key] =
				value?.constructor === Object && targetCopy[key]?.constructor === Object
					? merge(targetCopy[key], value)
					: value;
		}
	}
	return targetCopy;
}

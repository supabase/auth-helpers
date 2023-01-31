/**
 * @param {...import('@sveltejs/kit').Handle} handlers
 * @returns {import('@sveltejs/kit').Handle}
 */
export function sequence(...handlers) {
	const length = handlers.length;
	if (!length) return ({ event, resolve }) => resolve(event);

	return ({ event, resolve }) => {
		return apply_handle(0, event, {});

		/**
		 * @param {number} i
		 * @param {import('@sveltejs/kit').RequestEvent} event
		 * @param {import('@sveltejs/kit').ResolveOptions | undefined} parent_options
		 * @returns {import('@sveltejs/kit/types/internal').MaybePromise<Response>}
		 */
		function apply_handle(i, event, parent_options) {
			const handle = handlers[i];

			return handle({
				event,
				resolve: (event, options) => {
					/** @param {{ html: string, done: boolean }} opts */
					const transformPageChunk = async ({ html, done }) => {
						if (options?.transformPageChunk) {
							html = (await options.transformPageChunk({ html, done })) ?? '';
						}

						if (parent_options?.transformPageChunk) {
							html = (await parent_options.transformPageChunk({ html, done })) ?? '';
						}

						return html;
					};

					/**
					 * @param {string} name
					 * @param {string} value
					 */
					const filterSerializedResponseHeaders = (name, value) => {
						return Boolean(
							options?.filterSerializedResponseHeaders?.(name, value) ||
								parent_options?.filterSerializedResponseHeaders?.(name, value)
						);
					};

					return i < length - 1
						? apply_handle(i + 1, event, {
								transformPageChunk,
								filterSerializedResponseHeaders
						  })
						: resolve(event, { transformPageChunk, filterSerializedResponseHeaders });
				}
			});
		}
	};
}

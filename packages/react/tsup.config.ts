import type { Options } from 'tsup';

export const tsup: Options = {
	dts: true,
	entryPoints: ['src/index.tsx'],
	external: ['react', /^@supabase\//],
	format: ['cjs'],
	//   inject: ['src/react-shim.js'],
	// ! .cjs/.mjs doesn't work with Angular's webpack4 config by default!
	legacyOutput: false,
	sourcemap: true,
	splitting: false,
	bundle: true,
	clean: true
};

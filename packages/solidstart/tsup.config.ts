import type { Options } from 'tsup';
import pkg from './package.json';

export const tsup: Options = {
	dts: true,
	entryPoints: ['src/index.ts'],
	external: ['remix', /^@supabase\//],
	format: ['esm', 'cjs'],
	// ! .cjs/.mjs doesn't work with Angular's webpack4 config by default!
	legacyOutput: false,
	sourcemap: true,
	splitting: false,
	bundle: true,
	clean: true,
	define: {
		PACKAGE_NAME: JSON.stringify(pkg.name),
		PACKAGE_VERSION: JSON.stringify(pkg.version)
	}
};

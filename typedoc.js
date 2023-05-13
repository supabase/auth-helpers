module.exports = {
	name: '@supabase/auth-helpers',
	out: './docs/',
	entryPoints: [
		'./packages/sveltekit/src/index.ts',
		'./packages/nextjs/src/index.ts',
		'./packages/shared/src/index.ts',
		'./packages/react/src/index.tsx'
	],
	entryPointStrategy: 'expand',
	exclude: [
		'packages/shared/src/utils/index.ts',
		'packages/sveltekit/svelte.config.js',
		'**/node_modules/**',
		'**/dist/**',
		'**/packages/**/tsup.config.ts'
	],
	excludeExternals: true,
	excludePrivate: true,
	hideGenerator: true,
	readme: 'none'
};

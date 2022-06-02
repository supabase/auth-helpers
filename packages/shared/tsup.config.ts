import type { Options } from 'tsup';

export const tsup: Options = {
  dts: true,
  entryPoints: ['src/index.ts'],
  // `aws-amplify` is external, but sub-dependencies weren't automatically externalized ("require" statements were included)
  external: ['react', 'next', /^@supabase\//],
  format: ['cjs', 'esm'],
  //   inject: ['src/react-shim.js'],
  // ! .cjs/.mjs doesn't work with Angular's webpack4 config by default!
  legacyOutput: false,
  sourcemap: true,
  splitting: false,
  bundle: true,
  clean: true
};

import type { Options } from 'tsup';

export const tsup: Options = {
  dts: true,
  entryPoints: ['src/index.ts'],
  external: ['@builder.io/qwik','@builder.io/qwik-city', /^@supabase\//],
  format: ['cjs'],
  legacyOutput: false,
  sourcemap: true,
  splitting: false,
  bundle: true,
  clean: true
};
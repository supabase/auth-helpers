/**
 * @type {import("tsup").Options}
 */
module.exports = {
  dts: true,
  entryPoints: ['src/helpers.ts', 'src/store.ts'],
  // `aws-amplify` is external, but sub-dependencies weren't automatically externalized ("require" statements were included)
  external: ['svelte', /^@supabase\//, /^@sveltejs\//, /^\$app\//],
  format: ['esm'],
  //   inject: ['src/react-shim.js'],
  // ! .cjs/.mjs doesn't work with Angular's webpack4 config by default!
  legacyOutput: false,
  sourcemap: false,
  bundle: true,
  splitting: false,
  clean: true
};

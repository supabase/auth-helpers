/**
 * @type {import("tsup").Options}
 */
module.exports = {
  dts: true,
  entryPoints: ["src"],
  // `aws-amplify` is external, but sub-dependencies weren't automatically externalized ("require" statements were included)
  external: ["next", "react", /^@supabase\//],
  format: ["cjs"],
  //   inject: ['src/react-shim.js'],
  // ! .cjs/.mjs doesn't work with Angular's webpack4 config by default!
  legacyOutput: false,
  sourcemap: "external",
  splitting: false,
};

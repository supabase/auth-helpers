/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    files: {
      lib: 'src'
    }
  },
  package: {
    dir: 'dist',
    exports(filepath) {
      return ['index.ts', 'server/index.ts'].includes(filepath);
    }
  }
};

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    files: {
      lib: 'src'
    },

    package: {
      dir: 'dist',
      exports: (file) => {
        return file === 'index.ts';
      }
    }
  }
};

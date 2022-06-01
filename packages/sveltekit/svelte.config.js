/** @type {import('@sveltejs/kit').Config} */
module.exports = {
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

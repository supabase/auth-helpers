const sveltePreprocess = require('svelte-preprocess');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: sveltePreprocess(),

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

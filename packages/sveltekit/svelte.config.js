const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: sveltePreprocess(),

  kit: {
    files: {
      lib: 'src',
    },

    package: {
      exports: (file) => {
        return file === 'index.ts';
      },
    },
  },
};
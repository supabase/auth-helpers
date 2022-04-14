module.exports = {
  name: '@supabase/auth-helpers',
  out: './docs/',
  entryPointStrategy: 'expand',
  exclude: ['./src/index.ts'],
  excludeExternals: true,
  excludePrivate: true,
  hideGenerator: true,
  readme: 'none'
};

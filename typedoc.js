module.exports = {
  name: '@supabase/auth-helpers',
  out: './docs/',
  entryPoints: ['./packages'],
  entryPointStrategy: 'expand',
  exclude: ['./node_modules/**'],
  excludeExternals: true,
  excludePrivate: true,
  hideGenerator: true,
  readme: 'none'
};

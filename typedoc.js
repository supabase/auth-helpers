module.exports = {
  name: '@supabase/auth-helpers',
  out: './docs/',
  entryPoints: ['./packages'],
  entryPointStrategy: 'expand',
  exclude: [
    'packages/shared/utils/index.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/packages/**/tsup.config.ts'
  ],
  excludeExternals: true,
  excludePrivate: true,
  hideGenerator: true,
  readme: 'none'
};

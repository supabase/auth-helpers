import type { ServerConfig } from '../types';

let config: ServerConfig;

export function setServerConfig(value: ServerConfig) {
  if (!config) {
    if (!value.supabaseClient) {
      throw new Error(
        'You need to pass the your supabase instance to `setupSupabaseServer`'
      );
    }
    config = value;
  }
}

export function getServerConfig(): ServerConfig {
  if (!config) {
    throw new Error(
      'Not initialized, make sure to call `setupSupabaseServer({ supabaseClient })` in `hooks.server.ts`'
    );
  }
  return config;
}

import type { ClientConfig } from './types';

let config: ClientConfig;

export function setClientConfig(value: ClientConfig) {
  if (!config) {
    if (!value.supabaseClient) {
      throw new Error(
        'You need to pass the your supabase instance to `setClientConfig`'
      );
    }
    config = value;
  }
}

export function getClientConfig(): ClientConfig {
  if (!config) {
    throw new Error(
      'Not initialized, make sure to call `setupSupabase({ supabaseClient })`'
    );
  }
  return config;
}

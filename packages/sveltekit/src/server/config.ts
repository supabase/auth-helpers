import type { ServerConfig } from '../types';

let config: ServerConfig;

export function setServerConfig(value: ServerConfig) {
	if (!config) {
		config = value;
	}
}

export function getServerConfig(): ServerConfig {
	if (!config) {
		throw new Error('Not initialized, make sure to call `auth({ supabaseClient })`');
	}
	return config;
}

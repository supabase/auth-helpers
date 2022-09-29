import type { Config } from './types';

let config: Config;

export function setConfig(value: Config): void {
  config = value;
}

export function getConfig(): Config {
  return config;
}

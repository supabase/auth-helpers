export const COOKIE_OPTIONS = {
  name: 'sb',
  lifetime: 7 * 24 * 60 * 60, // 7 days
  domain: '',
  path: '/',
  sameSite: 'lax'
};

export const TOKEN_REFRESH_MARGIN = 10; // in seconds
export const RETRY_INTERVAL = 2; // in hundred ms (initial retry after 200ms with exponential backoff)
export const MAX_RETRIES = 10;

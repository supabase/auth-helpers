export const COOKIE_OPTIONS = {
  name: 'sb',
  lifetime: 7 * 24 * 60 * 60, // 7 days
  domain: '',
  path: '/',
  sameSite: 'lax'
};

export const TOKEN_REFRESH_MARGIN = 10; // in seconds

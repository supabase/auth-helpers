export function supabaseAuthSveltekitStorageAdapter({
  path = '/api/supabase',
  fetch: _fetch = fetch
}: {
  path?: string;
  fetch?: typeof window.fetch;
}) {
  return {
    async getItem() {
      const session = await _fetch(path, { credentials: 'same-origin' })
        .then((res) => res.text())
        .catch(() => null);
      return session;
    },
    async setItem(_key: string, value: string) {
      await _fetch(path, {
        method: 'POST',
        body: value,
        credentials: 'same-origin'
      }).catch(() => null);
    },
    async removeItem() {
      await _fetch(path, {
        method: 'DELETE',
        credentials: 'same-origin'
      }).catch(() => null);
    }
  };
}

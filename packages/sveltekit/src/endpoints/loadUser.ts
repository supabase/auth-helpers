import type { Locals } from '../types';

export async function loadUser(event: any) {
  const { user, accessToken } = event.locals as Locals;
  return {
    status: 200,
    body: {
      user,
      accessToken
    }
  };
}

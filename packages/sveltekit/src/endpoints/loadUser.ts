export async function loadUser(event: any) {
  const { user, accessToken } = event.locals as App.Locals;
  return {
    status: 200,
    body: {
      user,
      accessToken
    }
  };
}

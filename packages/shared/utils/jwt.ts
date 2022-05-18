export const jwtDecoder = (jwt: string) =>
  atob
    ? JSON.parse(atob(jwt.split('.')[1]))
    : JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('utf8'));

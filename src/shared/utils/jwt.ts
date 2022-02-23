export const jwtDecoder = (jwt: string) =>
  JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('utf8'));

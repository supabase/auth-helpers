export const jwtDecoder = (jwt: string) => JSON.parse(atob(jwt.split('.')[1]));

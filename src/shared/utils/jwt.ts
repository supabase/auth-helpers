import { decodeJwt } from 'jose';

export const jwtDecoder = (jwt: string) => decodeJwt(jwt);

import { JWTPayload } from '../types';
import { JWTInvalid, JWTPayloadFailed } from './errors';

const decoder = new TextDecoder();

export function jwtDecoder(jwt: string): JWTPayload {
  const { 1: payload, length } = jwt.split('.');

  if (length !== 3) {
    throw new JWTInvalid();
  }

  try {
    const decoded = Buffer.from(payload, 'base64');
    const result = JSON.parse(decoder.decode(decoded));

    return result;
  } catch (err) {
    throw new JWTPayloadFailed();
  }
}

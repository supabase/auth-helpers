import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next';
import getUser from './getUser';
import { jwtDecoder } from '../../shared/utils/jwt';
import { CookieOptions } from '../types';

export default async function getAccessToken(
  context:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
  cookieOptions: CookieOptions = {
    name: 'sb'
  }
): Promise<string | null> {
  if (!context.req.cookies) {
    throw new Error('Not able to parse cookies!');
  }
  const access_token =
    context.req.cookies[`${cookieOptions.name}-access-token`];

  if (!access_token) {
    throw new Error('No cookie found!');
  }

  // Get payload from access token.
  const jwtUser = jwtDecoder(access_token);
  if (!jwtUser?.exp) {
    throw new Error('Not able to parse JWT payload!');
  }
  const timeNow = Math.round(Date.now() / 1000);
  if (jwtUser.exp < timeNow) {
    // JWT is expired, let's refresh from Gotrue
    const { accessToken } = await getUser(context, cookieOptions);
    return accessToken;
  } else {
    return access_token;
  }
}

import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse
} from 'next';
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

  return access_token;
}

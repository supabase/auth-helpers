import { CookieOptions } from '../types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookies } from '../../shared/utils/cookies';
import {
  NextRequestAdapter,
  NextResponseAdapter
} from '../../shared/adapters/NextAdapter';

export default function handelCallback(
  req: NextApiRequest,
  res: NextApiResponse,
  cookieOptions: CookieOptions
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
  const { event, session } = req.body;

  if (!event) throw new Error('Auth event missing!');
  if (event === 'SIGNED_IN') {
    if (!session) throw new Error('Auth session missing!');
    setCookies(
      new NextRequestAdapter(req),
      new NextResponseAdapter(res),
      [
        { key: 'access-token', value: session.access_token },
        { key: 'refresh-token', value: session.refresh_token }
      ].map((token) => ({
        name: `${cookieOptions.name}-${token.key}`,
        value: token.value,
        domain: cookieOptions.domain,
        maxAge: cookieOptions.lifetime ?? 0,
        path: cookieOptions.path,
        sameSite: cookieOptions.sameSite
      }))
    );
  }
  if (event === 'SIGNED_OUT') {
    setCookies(
      new NextRequestAdapter(req),
      new NextResponseAdapter(res),
      ['access-token', 'refresh-token'].map((key) => ({
        name: `${cookieOptions.name}-${key}`,
        value: '',
        maxAge: -1
      }))
    );
  }
  res.status(200).json({});
}

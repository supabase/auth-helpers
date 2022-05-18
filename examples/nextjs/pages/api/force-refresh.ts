import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@supabase/auth-helpers-nextjs';

export default async function ForceRefresh(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run queries with RLS on the server
  const user = await getUser({ req, res }, { forceRefresh: true });
  res.json(user);
}

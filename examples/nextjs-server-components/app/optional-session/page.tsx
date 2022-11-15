import 'server-only';

import { headers, cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../db_types';

// do not cache this page
export const revalidate = 0;

// this page will display with or without a user session
export default async function OptionalSession() {
  const supabase = createServerComponentSupabaseClient<Database>({
    headers,
    cookies
  });

  const { data } = await supabase.from('posts').select('*');

  return <pre>{JSON.stringify({ data }, null, 2)}</pre>;
}

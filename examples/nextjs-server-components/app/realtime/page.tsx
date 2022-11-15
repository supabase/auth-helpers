import 'server-only';

import { headers, cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import RealtimePosts from './realtime-posts';
import { Database } from '../../db_types';

// do not cache this page
export const revalidate = 0;

// this component fetches the current posts server-side
// and subscribes to new posts client-side
export default async function Realtime() {
  const supabase = createServerComponentSupabaseClient<Database>({
    headers,
    cookies
  });

  const { data } = await supabase.from('posts').select('*');

  // data can be passed from server components to client components
  // this allows us to fetch the initial posts before rendering the page
  // our <RealtimePosts /> component will then subscribe to new posts client-side
  return <RealtimePosts serverPosts={data || []} />;
}

// Next.js 13 Client Component
// NOTE: This is experimental and used as research to understand how to support Next.js 13 in the future.
// https://beta.nextjs.org/docs/data-fetching/fetching#example-fetch-and-use-in-client-components

import { use } from 'react';
import { createClient } from '@supabase/supabase-js';

async function getData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data } = await supabase.from('products').select('*').limit(1);

  return { user, data };
}

export default function Page() {
  const data = use(getData());
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createServerClient } from 'utils/supabase.server';

import type { LoaderArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const { data } = await supabase.from('posts').select('*');

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { data, session },
    {
      headers: response.headers
    }
  );
};

export default function OptionalSession() {
  // by fetching the session in the loader, we ensure it is available
  // for first SSR render - no flashing of incorrect state
  const { data, session } = useLoaderData<typeof loader>();

  return <pre>{JSON.stringify({ data, session }, null, 2)}</pre>;
}

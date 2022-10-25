import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseClient, User } from '@supabase/auth-helpers-remix';
import { Database } from '../../db_types';

type LoaderData = {
  user: User | undefined;
};

// this route demonstrates how to subscribe to fetch the user
// on the server to ensure it is available for first SSR render
export const loader: LoaderFunction = async ({
  request
}: {
  request: Request;
}) => {
  const response = new Response();
  const supabaseClient = createSupabaseClient<Database>(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { request, response }
  );

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  const user = session?.user;

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { user },
    {
      headers: response.headers
    }
  );
};

export default function ConditionalSSR() {
  // by fetching the user in the loader, we ensure it is available
  // for first SSR render - no flashing of incorrect state
  const { user } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      {user ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>You are not signed in</p>
      )}
    </div>
  );
}

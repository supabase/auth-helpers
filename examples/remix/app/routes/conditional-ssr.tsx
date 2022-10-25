import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getSupabase } from '@supabase/auth-helpers-remix';

// this route demonstrates how to subscribe to fetch the user
// on the server to ensure it is available for first SSR render
export const loader: LoaderFunction = async ({
  request
}: {
  request: Request;
}) => {
  const response = new Response();
  const supabaseClient = getSupabase({ request, response });

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
  const { user } = useLoaderData();

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

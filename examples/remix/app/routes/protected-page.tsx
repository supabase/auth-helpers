import { json, LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseClient, User } from '@supabase/auth-helpers-remix';
import { Database } from '../../db_types';

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

  if (!user) {
    // there is no user, therefore, we are redirecting
    // to the landing page. we still need to return
    // response.headers to attach the set-cookie header
    return redirect('/', {
      headers: response.headers
    });
  }

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { user },
    {
      headers: response.headers
    }
  );
};

export default function ProtectedPage() {
  // by fetching the user in the loader, we ensure it is available
  // for first SSR render - no flashing of incorrect state
  const { user } = useLoaderData<{ user: User }>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

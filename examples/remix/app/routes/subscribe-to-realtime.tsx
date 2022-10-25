import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { createSupabaseClient } from '@supabase/auth-helpers-remix';
import { useEffect } from 'react';
import { Database } from '../../db_types';

// this route demonstrates how to subscribe to realtime updates
// and synchronize data between server and client
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

  const { data, error } = await supabaseClient.from('test').select('*');

  if (error) {
    throw error;
  }

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { data, session },
    {
      headers: response.headers
    }
  );
};

export default function SubscribeToRealtime() {
  const { data, session } = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    // Note: window.env is not automatically populated by Remix
    // Check out the [example in this repo](../root.tsx) or
    // [Remix docs](https://remix.run/docs/en/v1/guides/envvars#browser-environment-variables) for more info
    const supabaseClient = createSupabaseClient<Database>(
      window.env.SUPABASE_URL,
      window.env.SUPABASE_ANON_KEY
    );
    // make sure you have enabled `Replication` for your table to receive realtime events
    // https://supabase.com/docs/guides/database/replication
    const channel = supabaseClient
      .channel('test')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test' },
        (payload) => {
          // you could manually merge the `payload` with `data` here
          // the `navigate` trick below causes all active loaders to be called again
          // this handles inserts, updates and deletes, keeping everything in sync
          // which feels more remix-y than manually merging state
          // https://sergiodxa.com/articles/automatic-revalidation-in-remix
          navigate('.', { replace: true });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [session]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  );
}

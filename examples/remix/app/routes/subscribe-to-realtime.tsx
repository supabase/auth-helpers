import { useEffect, useState } from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useOutletContext } from '@remix-run/react';
import { createServerClient } from '@supabase/auth-helpers-remix';
import type { ContextType } from '../root';
import { Database } from '../../db_types';
type TestData = Database['public']['Tables']['test']['Row'];

// Fetch the initial data server-side, then subscribe to updates client-side.
export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabaseClient = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { data, error } = await supabaseClient.from('test').select('*');

  if (error) {
    throw error;
  }

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    { data },
    {
      headers: response.headers
    }
  );
};

export default function SubscribeToRealtime() {
  const { session, supabase } = useOutletContext<ContextType>();
  const { data: serverLoadedData } = useLoaderData<{ data: TestData[] }>();
  const [data, setData] = useState<TestData[]>(serverLoadedData);

  useEffect(() => {
    if (supabase && session) {
      // Subscribe to updates client-side
      const channel = supabase
        .channel('test')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'test' },
          (payload) => {
            setData((data) => [...data, payload.new as TestData]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session, supabase]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <button
        onClick={async (e) => {
          e.preventDefault();
          if (supabase) {
            const { error } = await supabase
              .from('test')
              .insert([{ user_id: session!.user.id }]);
            if (error) console.log(error);
          }
        }}
      >
        Add entry
      </button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

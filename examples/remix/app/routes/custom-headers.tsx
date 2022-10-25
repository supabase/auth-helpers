import { HeadersFunction, json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseClient } from '@supabase/auth-helpers-remix';
import { Database } from '../../db_types';

// this route demonstrates a simple server-side authenticated supabase query
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

  const { data } = await supabaseClient.from('test').select('*');

  // in order for the set-cookie header from Supabase to be set,
  // response.headers must be returned as part of the loader response
  return json(
    { data },
    {
      headers: response.headers
    }
  );
};

export const headers: HeadersFunction = () => {
  // add custom headers here
  // learn more: https://sergiodxa.com/articles/loader-vs-route-cache-headers-in-remix
  return {
    'X-Custom-Header': 'custom header value'
  };
};

export default function CustomHeaders() {
  const { data } = useLoaderData();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

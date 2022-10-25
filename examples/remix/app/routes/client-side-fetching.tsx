import { getSupabase } from '@supabase/auth-helpers-remix';
import { useEffect, useState } from 'react';

// this route demonstrates how to query Supabase client-side
export default function ClientSideFetching() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabaseClient = getSupabase();

    const getData = async () => {
      const { data: supabaseData } = await supabaseClient
        .from('test')
        .select('*');

      setIsLoading(false);
      setData(supabaseData);
    };

    getData();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  );
}

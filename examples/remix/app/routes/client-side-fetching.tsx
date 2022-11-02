import { useEffect, useState } from 'react';
import { useOutletContext } from '@remix-run/react';
import type { ContextType } from '../root';

// this route demonstrates how to query Supabase client-side
export default function ClientSideFetching() {
  const { session, supabase } = useOutletContext<ContextType>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      if (!supabase) return;
      const { data: supabaseData } = await supabase.from('test').select('*');

      setIsLoading(false);
      setData(supabaseData);
    };

    if (session) getData();
  }, [session, supabase]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  );
}

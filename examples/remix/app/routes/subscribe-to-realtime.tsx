import { useEffect, useState } from 'react';
import { useOutletContext } from '@remix-run/react';
import { Database } from '../../db_types';
import type { ContextType } from '../root';

type TestData = Database['public']['Tables']['test']['Row'];

export default function SubscribeToRealtime() {
  const [data, setData] = useState<TestData[]>([]);
  const { session, supabase } = useOutletContext<ContextType>();

  useEffect(() => {
    if (supabase && session) {
      // Fetch initial data
      supabase
        .from('test')
        .select('*')
        .then(({ data }) => setData(data ?? []));

      // Subscribe to updates
      const channel = supabase
        .channel('test')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'test' },
          (payload) => {
            console.log(payload);
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
          console.log('adding entry', session?.user.id);
          e.preventDefault();
          const { error } = await supabase!
            .from('test')
            .insert([{ user_id: session!.user.id }]);
          console.log(error);
        }}
      >
        Add entry
      </button>
      <pre>{JSON.stringify({ data }, null, 2)}</pre>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { createBrowserClient, Session } from '@supabase/auth-helpers-remix';
import { Database } from '../../db_types';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabaseClient = createBrowserClient<Database>(
      window.env.SUPABASE_URL,
      window.env.SUPABASE_ANON_KEY
    );

    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify({ session }, null, 2)}</pre>
    </div>
  );
}

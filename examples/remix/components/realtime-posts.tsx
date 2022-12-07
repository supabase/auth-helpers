import { useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';

import type { SupabaseContext } from '~/routes/__supabase';
import type { Database } from 'db_types';

type Post = Database['public']['Tables']['posts']['Row'];

export default function RealtimePosts({
  serverPosts
}: {
  serverPosts: Post[];
}) {
  const [posts, setPosts] = useState(serverPosts);
  const { supabase } = useOutletContext<SupabaseContext>();

  useEffect(() => {
    setPosts(serverPosts);
  }, [serverPosts]);

  useEffect(() => {
    const channel = supabase
      .channel('*')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => setPosts([...posts, payload.new as Post])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, posts, setPosts]);

  return <pre>{JSON.stringify(posts, null, 2)}</pre>;
}

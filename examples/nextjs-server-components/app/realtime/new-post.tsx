'use client';

import { useSupabase } from '../../components/supabase-provider';

export default function NewPost() {
  const { supabase, session } = useSupabase();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      post: { value: string };
    };
    const post = target.post.value;

    await supabase.from('posts').insert({ content: post });
    // no need to refresh, as we are subscribed to db changes in `./realtime-posts.tsx`
  };

  return session ? (
    <>
      <form onSubmit={handleSubmit}>
        <input type="text" name="post" />
        <button>Send</button>
      </form>
    </>
  ) : (
    <p>Sign in to see posts</p>
  );
}

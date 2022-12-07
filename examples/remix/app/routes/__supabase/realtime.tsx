import { Form, useLoaderData } from '@remix-run/react';
import { createServerClient } from 'utils/supabase.server';
import { json } from '@remix-run/node';
import RealtimePosts from 'components/realtime-posts';

import type { ActionArgs, LoaderArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const { post } = Object.fromEntries(await request.formData());

  const { error } = await supabase
    .from('posts')
    .insert({ content: String(post) });

  if (error) {
    console.log(error);
  }

  return json(null, { headers: response.headers });
};

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const supabase = createServerClient({ request, response });

  const { data } = await supabase.from('posts').select();

  return json({ posts: data ?? [] }, { headers: response.headers });
};

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <>
      <RealtimePosts serverPosts={posts} />
      <Form method="post">
        <input type="text" name="post" />
        <button type="submit">Send</button>
      </Form>
    </>
  );
}

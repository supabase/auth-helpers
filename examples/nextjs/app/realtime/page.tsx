import NewPost from './new-post';
import RealtimePosts from './realtime-posts';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// this component fetches the current posts server-side
// and subscribes to new posts client-side
export default async function Realtime() {
	const supabase = createServerComponentClient<Database>({ cookies });

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const { data } = await supabase.from('posts').select('*');

	// data can be passed from server components to client components
	// this allows us to fetch the initial posts before rendering the page
	// our <RealtimePosts /> component will then subscribe to new posts client-side
	return session ? (
		<>
			<RealtimePosts serverPosts={data || []} />
			<NewPost />
		</>
	) : (
		<p>Sign in to see posts</p>
	);
}

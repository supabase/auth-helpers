import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// this page will display with or without a user session
export default async function OptionalSession() {
	const supabase = createServerComponentClient<Database>({ cookies });
	const { data } = await supabase.from('posts').select('*');

	return <pre>{JSON.stringify({ data }, null, 2)}</pre>;
}

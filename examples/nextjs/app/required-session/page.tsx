import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// this page will only be accessible to signed in users with a valid session
export default async function RequiredSession() {
	const supabase = createServerComponentClient<Database>({ cookies });

	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session) {
		redirect('/');
	}

	const { data } = await supabase.from('posts').select('*');

	return <pre>{JSON.stringify({ data }, null, 2)}</pre>;
}

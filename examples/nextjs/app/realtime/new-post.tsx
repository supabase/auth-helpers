import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default function NewPost() {
	const supabase = createServerComponentClient<Database>({ cookies });

	const addPost = async (formData: FormData) => {
		'use server';
		const content = String(formData.get('content'));
		await supabase.from('posts').insert({ content });
	};

	return (
		<form action={addPost}>
			<input type="text" name="content" />
			<button>Save</button>
		</form>
	);
}

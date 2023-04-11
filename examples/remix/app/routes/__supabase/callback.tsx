import { type LoaderArgs, redirect } from '@remix-run/node';
import { createServerClient } from 'utils/supabase.server';

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const response = new Response();
  if (code) {
    const supabase = createServerClient({ request, response });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect('/', {
    status: 303,
    headers: response.headers
  });
}

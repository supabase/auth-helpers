import 'server-only';

import { createServerClient } from '../../utils/supabase-server';

// do not cache this page
export const revalidate = 0;

// the user will be redirected to the landing page if they are not signed in
// check middleware.tsx to see how this routing rule is set
export default async function RequiredSession() {
  const supabase = createServerClient();
  const { data } = await supabase.from('posts').select('*');

  return <pre>{JSON.stringify({ data }, null, 2)}</pre>;
}

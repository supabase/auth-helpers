// pages/api/protected-route.ts
import {
  withApiAuth,
  supabaseServerClient
} from '@supabase/supabase-auth-helpers/nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  // Run queries with RLS on the server
  const { data } = await supabaseServerClient({ req, res })
    .from('test')
    .select('*');
  res.json(data);
});

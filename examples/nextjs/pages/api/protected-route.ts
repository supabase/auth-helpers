// pages/api/protected-route.ts
import {
  withAuthRequired,
  supabaseServerClient
} from '@supabase/auth-helpers/nextjs';

export default withAuthRequired(async function ProtectedRoute(req, res) {
  // Run queries with RLS on the server
  const { data } = await supabaseServerClient({ req, res })
    .from('test')
    .select('*');
  res.json(data);
});

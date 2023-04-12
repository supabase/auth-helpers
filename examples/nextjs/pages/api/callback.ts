// pages/api/protected-route.ts
import { NextApiHandler } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const callback: NextApiHandler = async (req, res) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });

  const code = req.query.code;

  if (typeof code === 'string') {
    await supabase.auth.exchangeCodeForSession(code);
  }

  res.redirect('/');
};

export default callback;

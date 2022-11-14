import 'server-only';

import { headers, cookies } from 'next/headers';
import SupabaseListener from '../components/supabase-listener';
import Login from '../components/login';
import './globals.css';
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../db_types';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentSupabaseClient<Database>({
    headers,
    cookies
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <Login />
        <SupabaseListener accessToken={session?.access_token} />
        {children}
      </body>
    </html>
  );
}

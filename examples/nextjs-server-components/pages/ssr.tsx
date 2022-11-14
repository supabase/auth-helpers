import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';
import Login from '../components/login';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    props: {
      session
    }
  };
};

export default function Profile({ session }: { session: any }) {
  return (
    <>
      <Login />
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </>
  );
}

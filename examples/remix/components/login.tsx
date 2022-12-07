import type { MaybeSession, TypedSupabaseClient } from '~/routes/__supabase';

export default function Login({
  supabase,
  session
}: {
  supabase: TypedSupabaseClient;
  session: MaybeSession;
}) {
  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'jon@supabase.com',
      password: 'password'
    });

    if (error) {
      console.log({ error });
    }
  };

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github'
    });

    if (error) {
      console.log({ error });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log(error);
    }
  };

  return session ? (
    <button onClick={handleLogout}>Logout</button>
  ) : (
    <>
      <button onClick={handleEmailLogin}>Email Login</button>
      <button onClick={handleGitHubLogin}>GitHub Login</button>
    </>
  );
}

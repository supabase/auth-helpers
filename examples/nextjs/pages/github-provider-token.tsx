// pages/protected-page.js
import { User, withPageAuth } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function ProtectedPage({
  user,
  allRepos
}: {
  user: User;
  allRepos: any;
}) {
  return (
    <>
      <p>
        [<Link href="/">Home</Link>] | [
        <Link href="/profile">withPageAuth</Link>]
      </p>
      <div>Protected content for {user.email}</div>
      <p>Data fetched with provider token:</p>
      <pre>{JSON.stringify(allRepos, null, 2)}</pre>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: '/',
  async getServerSideProps(ctx, supabase) {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    if (!session) {
      return { props: {} };
    }

    // Retrieve provider_token & logged in user's third-party id from metadata
    const { provider_token, user } = session;
    const userId = user.user_metadata.user_name;

    const allRepos = await (
      await fetch(
        `https://api.github.com/search/repositories?q=user:${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `token ${provider_token}`
          }
        }
      )
    ).json();

    return { props: { allRepos, user } };
  }
});

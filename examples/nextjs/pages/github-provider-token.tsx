// pages/protected-page.js
import { User, withPageAuth, getUser } from '@supabase/auth-helpers-nextjs';
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
  async getServerSideProps(ctx) {
    // Retrieve provider_token from cookies
    const provider_token = ctx.req.cookies['sb-provider-token'];
    // Get logged in user's third-party id from metadata
    const { user } = await getUser(ctx);
    const userId = user?.user_metadata.user_name;
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

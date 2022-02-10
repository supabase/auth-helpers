// pages/protected-page.js
import {
  withAuthRequired,
  getUser,
  User
} from '@supabase/supabase-auth-helpers/nextjs';

export default function ProtectedPage({
  user,
  email,
  other
}: {
  user: User;
  email: string;
  other: string;
}) {
  return (
    <>
      <div>Protected content for {email}</div>
      <p>{other}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withAuthRequired({
  redirectTo: '/foo',
  async getServerSideProps(ctx) {
    // access the user object
    const user = await getUser(ctx);
    return { props: { email: user!.email, other: 'blabla' } };
  }
});

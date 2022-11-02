import { useOutletContext } from '@remix-run/react';
import type { ContextType } from '../root';

// This example shows you how to handle Auth manually without the pre-built Auth UI.

export default function Index() {
  const { supabase, session } = useOutletContext<ContextType>();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    if (!supabase) return;
    const formData = new FormData(event.currentTarget);
    const email = formData.get('loginEmail') as string;
    const password = formData.get('loginPassword') as string;
    // Sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  if (session)
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
        <pre>{JSON.stringify({ session }, null, 2)}</pre>
      </div>
    );

  // Auth form
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <form onSubmit={handleSubmit}>
        <h1>Custom login form:</h1>
        <div>
          <label htmlFor="loginEmail">Email:</label>
          <input type="text" id="loginEmail" name="loginEmail" required />
        </div>
        <div>
          <label htmlFor="loginPassword">Password:</label>
          <input
            type="password"
            id="loginPassword"
            name="loginPassword"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <hr />
      <button
        onClick={() => {
          supabase?.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: 'http://localhost:3004'
            }
          });
        }}
      >
        GitHub OAuth
      </button>
    </div>
  );
}

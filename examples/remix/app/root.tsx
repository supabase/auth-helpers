import {
  ActionFunction,
  json,
  redirect,
  LoaderFunction,
  MetaFunction
} from '@remix-run/node';
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react';
import { createServerClient } from '@supabase/auth-helpers-remix';
import { Database } from '../db_types';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1'
});

declare global {
  interface Window {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}

export const loader: LoaderFunction = () => {
  // environment variables may be stored somewhere other than
  // `process.env` in runtimes other than node
  // we need to pipe these Supabase environment variables to the browser
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  return json({
    env: {
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    }
  });
};

export const action: ActionFunction = async ({
  request
}: {
  request: Request;
}) => {
  const {
    _action,
    registerEmail,
    registerPassword,
    loginEmail,
    loginPassword
  } = Object.fromEntries(await request.formData());
  const response = new Response();

  const supabaseClient = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  // `_action` is a convention as `action` is a reserved keyword that may break the web
  // this can be named anything that is not a reserved keyword
  // Ryan's excellent explanation: https://www.youtube.com/watch?v=w2i-9cYxSdc
  if (_action === 'register') {
    let { data, error } = await supabaseClient.auth.signUp({
      email: String(registerEmail),
      password: String(registerPassword)
    });

    // in order for the set-cookie header to be set,
    // headers must be returned as part of the loader response
    return json(
      { data, error },
      {
        headers: response.headers
      }
    );
  }

  if (_action === 'login') {
    let { data, error } = await supabaseClient.auth.signInWithPassword({
      email: String(loginEmail),
      password: String(loginPassword)
    });

    // in order for the set-cookie header to be set,
    // headers must be returned as part of the loader response
    return json(
      { data, error },
      {
        headers: response.headers
      }
    );
  }

  // GitHub OAuth
  if (_action === 'github') {
    const { error, data } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: { scopes: 'repo', redirectTo: 'http://localhost:3004' }
    });

    // in order for the set-cookie header to be set,
    // headers must be returned as part of the loader response
    if (error)
      return json(
        { error },
        {
          headers: response.headers
        }
      );

    return redirect(data.url, {
      headers: response.headers
    });
  }

  if (_action === 'logout') {
    let { error } = await supabaseClient.auth.signOut();

    // in order for the set-cookie header to be set,
    // headers must be returned as part of the loader response
    return json(
      { error },
      {
        headers: response.headers
      }
    );
  }
};

// this route demonstrates how to login and logout
// with Supabase on the server. It also shows how to
// pipe environment variables from the server to the browser
export default function App() {
  const { env } = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Form method="post">
          <div>
            <label htmlFor="registerEmail">Email:</label>
            <input type="text" id="registerEmail" name="registerEmail" />
          </div>
          <div>
            <label htmlFor="registerPassword">Password:</label>
            <input
              type="password"
              id="registerPassword"
              name="registerPassword"
            />
          </div>
          <button type="submit" name="_action" value="register">
            Register
          </button>
        </Form>
        <hr />
        <Form method="post">
          <div>
            <label htmlFor="loginEmail">Email:</label>
            <input type="text" id="loginEmail" name="loginEmail" />
          </div>
          <div>
            <label htmlFor="loginPassword">Password:</label>
            <input type="password" id="loginPassword" name="loginPassword" />
          </div>
          <button type="submit" name="_action" value="login">
            Login
          </button>
        </Form>
        <hr />
        <Form method="post">
          <button type="submit" name="_action" value="github">
            GitHub Oauth
          </button>
        </Form>
        <hr />
        <Form method="post">
          <button type="submit" name="_action" value="logout">
            Logout
          </button>
        </Form>
        <hr />
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

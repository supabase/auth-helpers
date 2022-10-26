// Next.js 13
// NOTE: This is experimental and used as research to understand how to support Next.js 13 in the future.

import Link from 'next/link';

export default async function Page() {
  return (
    <>
      <h1>Next.js 13 examples</h1>
      <ul>
        <li>
          fetch and use in Client Components [
          <Link href={'/nextjs-13/client-component'}>example</Link> |{' '}
          <a href="https://beta.nextjs.org/docs/data-fetching/fetching#example-fetch-and-use-in-client-components">
            docs
          </a>
          ]
        </li>
        <li>
          Dynamic Data (used to be getServerSideProps) [
          <Link href={'/nextjs-13/ssr'}>example</Link> |{' '}
          <a href="https://beta.nextjs.org/docs/data-fetching/fetching#dynamic-data">
            docs
          </a>
          ]
        </li>
      </ul>
    </>
  );
}

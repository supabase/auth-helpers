import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://app.supabase.com">Supabase</a> on{' '}
          <a href="https://nextjs.org">Next.js 13!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>app/page.tsx</code>
        </p>

        <div className={styles.grid}>
          <a href="/optional-session" className={styles.card}>
            <h2>Optional Session &rarr;</h2>
            <p>Visit this page with or without a session.</p>
          </a>

          <a href="/required-session" className={styles.card}>
            <h2>Required Session &rarr;</h2>
            <p>Get redirected if you don't have a session.</p>
          </a>

          <a href="/realtime" className={styles.card}>
            <h2>Realtime &rarr;</h2>
            <p>Merge server and client state with realtime.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

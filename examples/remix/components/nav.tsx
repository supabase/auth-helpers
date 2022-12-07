import { Link } from '@remix-run/react';

export default function Nav() {
  return (
    <nav>
      <Link to="/optional-session" style={{ display: 'block' }}>
        Optional Session ✅
      </Link>
      <Link to="/required-session" style={{ display: 'block' }}>
        Required Session 👮‍♀️
      </Link>
      <Link to="/realtime" style={{ display: 'block' }}>
        Realtime ⏱️
      </Link>
    </nav>
  );
}

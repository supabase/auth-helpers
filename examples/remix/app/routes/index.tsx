import { useOutletContext } from '@remix-run/react';

import type { ContextType } from '../root';

export default function Index() {
  const { session } = useOutletContext<ContextType>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <pre>{JSON.stringify({ session }, null, 2)}</pre>
    </div>
  );
}

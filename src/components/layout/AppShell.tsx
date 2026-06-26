'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomTicker from './BottomTicker';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar pendingCount={0} />
      <BottomTicker />
      <main id="main-content">{children}</main>
    </>
  );
}

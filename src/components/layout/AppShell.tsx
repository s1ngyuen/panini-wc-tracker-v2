'use client';

import Navbar from './Navbar';
import BottomTicker from './BottomTicker';

// AppShell wraps every page (including the login page, per the decision in plan.md §11).
// pendingCount will be wired up via useTrades() once that hook is built (Phase 3).
// For now it defaults to 0 so the badge is hidden.
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar pendingCount={0} />
      <BottomTicker />
      <main id="main-content">{children}</main>
    </>
  );
}

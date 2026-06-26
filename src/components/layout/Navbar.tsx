'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import MobileDrawer from './MobileDrawer';
import AddCardsModal from '@/components/ui/AddCardsModal';

interface NavbarProps {
  pendingCount: number;
}

const LEFT_ITEMS = [{ href: '/collection', label: 'Collection' }];
const RIGHT_ITEMS = [{ href: '/swaps', label: 'Swaps' }];

function NavTab({
  href,
  label,
  isActive,
  badge,
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`nav-tab${isActive ? ' active' : ''}`}
      aria-label={label}
      aria-pressed={isActive}
    >
      <span className="nav-scrl">
        <span className="nav-scrl-inner">
          <span>{label}</span>
          <span>{label}</span>
        </span>
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="nav-tab__badge" aria-label={`${badge} pending trades`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Navbar({ pendingCount }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addCardsOpen, setAddCardsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const avatarUrl = session?.user?.image ?? null;
  const avatarAlt = session?.user?.name ?? 'User avatar';

  return (
    <>
      <header id="app-header">
        {/* Left nav — Collection tab */}
        <nav id="nav-left" aria-label="Left navigation">
          {LEFT_ITEMS.map((item) => (
            <NavTab
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isActive(item.href)}
            />
          ))}
        </nav>

        {/* Centre logo */}
        <div className="header-logo">
          <Link href="/" aria-label="Swappa home">
            <img
              src="/assets/wc26-logo.png"
              alt="World Cup 2026 Adrenalyn XL"
              width={120}
              height={44}
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>
        </div>

        {/* Right nav — Swaps tab + actions */}
        <div id="nav-right-wrap">
          <nav id="nav-right" aria-label="Right navigation">
            {RIGHT_ITEMS.map((item) => (
              <NavTab
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isActive(item.href)}
                badge={item.href === '/swaps' ? pendingCount : undefined}
              />
            ))}

            {/* Add Cards button — desktop only */}
            <button
              id="add-cards-btn"
              type="button"
              className="btn-reset"
              onClick={() => setAddCardsOpen(true)}
            >
              <span className="btn-scrl">
                <span className="btn-scrl-inner">
                  <span>Add Cards</span>
                  <span>Add Cards</span>
                </span>
              </span>
            </button>

            {/* Export JSON — desktop only */}
            <button
              id="export-collection-btn"
              type="button"
              className="btn-reset"
              aria-label="Export collection"
              onClick={() => {
                fetch('/api/collection')
                  .then(r => r.json())
                  .then(data => {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'wc2026-collection.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  });
              }}
            >
              <span className="btn-scrl">
                <span className="btn-scrl-inner">
                  <span>Export</span>
                  <span>Export</span>
                </span>
              </span>
            </button>

            {/* Import JSON — desktop only */}
            <button
              id="import-collection-btn"
              type="button"
              className="btn-reset"
              aria-label="Import collection"
              onClick={() => setImportOpen(true)}
            >
              <span className="btn-scrl">
                <span className="btn-scrl-inner">
                  <span>Import</span>
                  <span>Import</span>
                </span>
              </span>
            </button>

            {/* Reset — desktop only */}
            <button
              id="clear-collection-btn"
              type="button"
              className="btn-reset"
              aria-label="Clear entire collection"
              onClick={() => {
                if (!confirm('Reset your entire collection? This cannot be undone.')) return;
                fetch('/api/collection', { method: 'DELETE' })
                  .then(() => window.location.reload());
              }}
            >
              <span className="btn-scrl">
                <span className="btn-scrl-inner">
                  <span>Reset</span>
                  <span>Reset</span>
                </span>
              </span>
            </button>

            {/* User avatar + sign-out — only when logged in */}
            {session?.user && (
              <button
                type="button"
                className="btn-reset"
                style={{ padding: '0 8px' }}
                onClick={() => signOut({ callbackUrl: '/' })}
                aria-label={`Sign out (${session.user.name ?? session.user.email ?? 'user'})`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={avatarAlt}
                    width={32}
                    height={32}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--surface-high)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-display)',
                    }}
                    aria-hidden="true"
                  >
                    {(session.user.name ?? 'U')[0].toUpperCase()}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Mobile hamburger — visible only on mobile via CSS */}
          <button
            id="mobile-menu-btn"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pendingCount={pendingCount}
        onAddCards={() => setAddCardsOpen(true)}
      />

      {/* Add Cards modal */}
      <AddCardsModal
        isOpen={addCardsOpen}
        onClose={() => setAddCardsOpen(false)}
      />

      {/* Import JSON modal */}
      {importOpen && (
        <div
          id="import-modal"
          style={{
            display: 'flex',
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setImportOpen(false); }}
        >
          <div style={{ background: '#fff', padding: '28px', width: 'min(480px,90vw)', position: 'relative' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '8px' }}>Import Collection</p>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Paste the JSON you exported, then click Import.</p>
            <textarea
              id="import-json"
              style={{ width: '100%', height: '140px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #ddd', padding: '8px', resize: 'vertical' }}
              placeholder='{"1":2,"42":1,...}'
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  const textarea = document.getElementById('import-json') as HTMLTextAreaElement | null;
                  if (!textarea) return;
                  let parsed: Record<string, number>;
                  try { parsed = JSON.parse(textarea.value); } catch { alert('Invalid JSON'); return; }
                  fetch('/api/collection', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsed),
                  }).then(r => {
                    if (!r.ok) { alert('Import failed'); return; }
                    setImportOpen(false);
                    window.location.reload();
                  });
                }}
              >
                Import
              </button>
              <button
                type="button"
                className="btn-reset"
                style={{ flex: 1 }}
                onClick={() => setImportOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount: number;
  onAddCards: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onReset?: () => void;
}

const NAV_ITEMS = [
  { href: '/collection', label: 'Collection' },
  { href: '/swaps', label: 'Swaps' },
];

export default function MobileDrawer({
  isOpen,
  onClose,
  pendingCount,
  onAddCards,
  onExport,
  onImport,
  onReset,
}: MobileDrawerProps) {
  const pathname = usePathname();

  // Lock body scroll while drawer is open; close on Escape
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <div className="mobile-drawer__backdrop" onClick={onClose} aria-hidden="true" />

      {/* Slide-out panel */}
      <div className="mobile-drawer__panel" tabIndex={-1}>
        {/* Close button */}
        <button
          className="mobile-drawer__close"
          onClick={onClose}
          aria-label="Close navigation menu"
          type="button"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="mobile-drawer__logo">
          <img
            src="/assets/wc26-logo.png"
            alt="World Cup 2026 logo"
            width={80}
            height={40}
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Nav links */}
        <nav id="mobile-drawer-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-drawer__nav-btn${isActive ? ' active' : ''}`}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {item.href === '/swaps' && pendingCount > 0 && (
                  <span className="nav-tab__badge" aria-label={`${pendingCount} pending trades`}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action buttons */}
        <div className="mobile-drawer__actions">
          <button
            id="m-add-cards-btn"
            type="button"
            className="mobile-drawer__action-btn"
            onClick={() => { onClose(); onAddCards(); }}
          >
            Add Cards
          </button>
          <button
            id="m-export-btn"
            type="button"
            className="mobile-drawer__action-btn"
            onClick={() => { onClose(); onExport?.(); }}
          >
            Export
          </button>
          <button
            id="m-import-btn"
            type="button"
            className="mobile-drawer__action-btn"
            onClick={() => { onClose(); onImport?.(); }}
          >
            Import
          </button>
          <button
            id="m-reset-btn"
            type="button"
            className="mobile-drawer__action-btn mobile-drawer__action-btn--danger"
            onClick={() => { onClose(); onReset?.(); }}
          >
            Reset Collection
          </button>
        </div>
      </div>
    </div>
  );
}

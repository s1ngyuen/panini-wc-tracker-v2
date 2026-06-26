'use client';

import CardInput from './CardInput';

export default function AddCardsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add Cards"
    >
      <div
        style={{
          background: '#fff',
          width: 'min(520px, 94vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            textTransform: 'uppercase',
            letterSpacing: '.04em',
            color: 'var(--accent)',
          }}>
            Add Cards
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#999',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* CardInput */}
        <div style={{ padding: '16px 4px 8px' }}>
          <CardInput />
        </div>
      </div>
    </div>
  );
}

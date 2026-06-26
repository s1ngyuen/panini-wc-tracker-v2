'use client';

interface Props {
  owned: number;
  pending: number;
  total: number;
  onClick: () => void;
}

export default function ProgressBar({ owned, pending, total, onClick }: Props) {
  const ownedPct    = total === 0 ? 0 : (owned   / total) * 100;
  const pendingPct  = total === 0 ? 0 : (pending  / total) * 100;
  const combinedPct = Math.round(ownedPct + pendingPct);
  const combined    = owned + pending;
  const hasPending  = pending > 0;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      className="collection-progress"
      role="button"
      tabIndex={0}
      aria-label="View progress breakdown"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="collection-progress__labels">
        <span className="collection-progress__count">
          <span className="cp-owned-n">
            {combined}{hasPending ? '*' : ''}
          </span>
          <span className="cp-total"> of {total} cards</span>
        </span>
        <span className="collection-progress__pct">{combinedPct}%</span>
      </div>

      <div className="collection-progress__bar-track">
        <div
          className="collection-progress__bar-fill"
          style={{ width: `${ownedPct}%` }}
        />
        <div
          className="collection-progress__bar-pending"
          style={{ width: `${pendingPct}%` }}
        />
      </div>

      <div className="collection-progress__key">
        <span className="collection-progress__key-owned">{owned} owned</span>
        <span className="collection-progress__key-pending">{pending} pending</span>
      </div>

      <div className="collection-progress__hint">Tap for full breakdown</div>
    </div>
  );
}

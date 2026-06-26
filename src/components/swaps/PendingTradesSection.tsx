'use client';

import type { Trade, CollectionMap } from '@/types';
import PendingTradeCard from './PendingTradeCard';

interface Props {
  trades: Trade[];
  collection: CollectionMap;
  onUpdate: (id: string, body: Partial<Trade>) => void;
  onDelete: (id: string) => void;
  onMarkDone: (trade: Trade) => void;
}

export default function PendingTradesSection({
  trades,
  collection,
  onUpdate,
  onDelete,
  onMarkDone,
}: Props) {
  return (
    <div>
      {/* Title tile */}
      <div className="pending-title-tile">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            textTransform: 'uppercase',
            letterSpacing: '.04em',
            color: 'var(--accent)',
          }}
        >
          Pending Trades{trades.length > 0 ? ` (${trades.length})` : ''}
        </span>
      </div>

      {trades.length === 0 ? (
        <p className="pb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          No pending trades. Generate a swap below and save it, or add a custom trade.
        </p>
      ) : (
        <div className="pending-trades-scroll">
          <div className="pending-trades-list">
            {trades.map((trade) => (
              <PendingTradeCard
                key={trade.id}
                trade={trade}
                collection={collection}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onMarkDone={onMarkDone}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { BONUS_CARDS, SPECIAL_TABS, BonusCard } from '@/data/cards';
import { CollectionMap } from '@/types';
import CardGrid from './CardGrid';

interface Props {
  tabKey: 'upgrades' | 'le' | 'wcm' | 'special';
  collection: CollectionMap;
  pendingCardIds: Set<string>;
  onCardClick: (card: BonusCard) => void;
}

export default function BonusPanel({ tabKey, collection, pendingCardIds, onCardClick }: Props) {
  const [status, setStatus] = useState('');

  const tabDef = SPECIAL_TABS.find(t => t.key === tabKey)!;
  const { cats, label } = tabDef;
  const showCatLabels = cats.length > 1;

  const cardsByCat = useMemo(() => {
    return cats.map(cat => {
      const all = BONUS_CARDS.filter(c => c.bonusCategory === cat);
      const filtered = all.filter(c => {
        if (!status) return true;
        const count = collection[String(c.id)] ?? 0;
        if (status === 'owned'   && count < 1)  return false;
        if (status === 'missing' && count >= 1) return false;
        return true;
      });
      return { cat, filtered };
    });
  }, [cats, status, collection]);

  const totalShown = cardsByCat.reduce((sum, { filtered }) => sum + filtered.length, 0);

  return (
    <div className="coll-panel">
      <div className="px-4 pb-3 pt-1">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="filter-section-title">{label}</span>

          <label htmlFor={`bonus-status-${tabKey}`} className="sr-only">Filter by status</label>
          <select
            id={`bonus-status-${tabKey}`}
            className="filter-select"
            aria-label="Filter by status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Cards</option>
            <option value="owned">Owned</option>
            <option value="missing">Missing</option>
          </select>

          {status && (
            <button
              type="button"
              className="btn-secondary text-sm px-3 py-2"
              onClick={() => setStatus('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bonus-cards-section">
        {totalShown === 0 ? (
          <p className="w-full text-center py-12 text-sm px-4" style={{ color: '#555' }}>
            No cards match that filter.
          </p>
        ) : (
          cardsByCat.map(({ cat, filtered }) => {
            if (filtered.length === 0) return null;
            return (
              <div key={cat}>
                {showCatLabels && (
                  <div className="bonus-cat-label">{cat}</div>
                )}
                <CardGrid
                  cards={filtered}
                  collection={collection}
                  pendingCardIds={pendingCardIds}
                  onCardClick={card => onCardClick(card as BonusCard)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

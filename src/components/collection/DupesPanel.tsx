import { useMemo } from 'react';
import { CARDS, BONUS_CARDS, Card, BonusCard } from '@/data/cards';
import { CollectionMap } from '@/types';
import CardGrid from './CardGrid';

interface Props {
  collection: CollectionMap;
  pendingCardIds: Set<string>;
  onCardClick: (card: Card | BonusCard) => void;
}

const ALL_CARDS = [...CARDS, ...BONUS_CARDS];

export default function DupesPanel({ collection, pendingCardIds, onCardClick }: Props) {
  const dupes = useMemo(() => {
    return ALL_CARDS.filter(c => (collection[String(c.id)] ?? 0) >= 2);
  }, [collection]);

  return (
    <div className="coll-panel">
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center">
          <span className="filter-section-title">Duplicates</span>
        </div>
      </div>

      {dupes.length === 0 ? (
        <p className="w-full text-center py-12 text-sm px-4" style={{ color: '#555' }}>
          No duplicates yet.
        </p>
      ) : (
        <CardGrid
          cards={dupes}
          collection={collection}
          pendingCardIds={pendingCardIds}
          onCardClick={onCardClick}
        />
      )}
    </div>
  );
}

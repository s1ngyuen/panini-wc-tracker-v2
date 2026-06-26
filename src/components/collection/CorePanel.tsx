'use client';

import { useState, useMemo } from 'react';
import { CARDS, TEAMS, CARD_TYPES, Card, BonusCard } from '@/data/cards';
import { CollectionMap } from '@/types';
import FilterBar from './FilterBar';
import CardGrid from './CardGrid';

interface FilterState {
  country: string;
  cardType: string;
  status: string;
}

interface Props {
  collection: CollectionMap;
  pendingCardIds: Set<string>;
  onCardClick: (card: Card | BonusCard) => void;
}

export default function CorePanel({ collection, pendingCardIds, onCardClick }: Props) {
  const [filter, setFilter] = useState<FilterState>({ country: '', cardType: '', status: '' });

  const filtered = useMemo(() => {
    return CARDS.filter(card => {
      if (filter.country  && card.country  !== filter.country)  return false;
      if (filter.cardType && card.cardType !== filter.cardType) return false;
      if (filter.status) {
        const count = collection[String(card.id)] ?? 0;
        if (filter.status === 'owned'      && count < 1)  return false;
        if (filter.status === 'missing'    && count > 0)  return false;
        if (filter.status === 'duplicates' && count < 2)  return false;
      }
      return true;
    });
  }, [filter, collection]);

  return (
    <div className="coll-panel">
      <div className="px-4 pb-3">
        <FilterBar
          title="Core Collection"
          teams={TEAMS}
          cardTypes={CARD_TYPES}
          onChange={setFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="w-full text-center py-12 text-sm" style={{ color: '#555' }}>
          No cards match that filter. Try a different team or type.
        </p>
      ) : (
        <CardGrid
          cards={filtered}
          collection={collection}
          pendingCardIds={pendingCardIds}
          onCardClick={onCardClick}
        />
      )}
    </div>
  );
}

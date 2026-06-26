import { Card, BonusCard } from '@/data/cards';
import { CollectionMap } from '@/types';
import PaniniCard from './PaniniCard';

interface Props {
  cards: (Card | BonusCard)[];
  collection: CollectionMap;
  pendingCardIds: Set<string>;
  onCardClick: (card: Card | BonusCard) => void;
}

export default function CardGrid({ cards, collection, pendingCardIds, onCardClick }: Props) {
  return (
    <div className="card-grid" role="list" aria-label="Card collection">
      {cards.map(card => (
        <div key={card.id} role="listitem">
          <PaniniCard
            card={card}
            count={collection[String(card.id)] ?? 0}
            isPending={pendingCardIds.has(String(card.id))}
            onClick={() => onCardClick(card)}
          />
        </div>
      ))}
    </div>
  );
}

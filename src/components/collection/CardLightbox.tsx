'use client';

import { useState, useEffect } from 'react';
import { Card, BonusCard } from '@/data/cards';
import { getPrice, getCurrency, getUpdated } from '@/lib/prices';

interface Props {
  card: Card | BonusCard | null;
  count: number;
  onRemove: (qty: number) => void;
  onClose: () => void;
}

function statusText(count: number): string {
  if (count === 0) return 'Missing';
  if (count === 1) return 'Owned';
  return `×${count} — ${count - 1} spare`;
}

function statusClass(count: number): string {
  if (count === 0) return 'card-lightbox__status card-lightbox__status--missing';
  if (count >= 2)  return 'card-lightbox__status card-lightbox__status--dupe';
  return 'card-lightbox__status card-lightbox__status--owned';
}

export default function CardLightbox({ card, count, onRemove, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const isOpen = card !== null;

  // Reset qty whenever the card or count changes
  useEffect(() => {
    setQty(1);
  }, [card?.id, count]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!card) return null;

  const clampedQty = Math.max(1, Math.min(qty, count));
  const price      = getPrice(card.id);
  const currency   = getCurrency();
  const updated    = getUpdated();
  const sym        = currency === 'AUD' ? 'A$' : '$';
  const showQtyRow = count > 1;
  const removeLabel = clampedQty === 1
    ? 'Remove Card'
    : `Remove ${clampedQty} Copies`;

  function changeQty(next: number) {
    setQty(Math.max(1, Math.min(next, count)));
  }

  async function handleRemove() {
    if (!card) return;
    const label = clampedQty === 1
      ? `Remove 1 copy of #${card.id} ${card.playerName} from your collection?`
      : `Remove ${clampedQty} copies of #${card.id} ${card.playerName} from your collection?`;
    if (!window.confirm(label)) return;
    onRemove(clampedQty);
  }

  return (
    <div
      className="card-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Card detail"
    >
      <div className="card-lightbox__backdrop" onClick={onClose} />
      <div className="card-lightbox__panel">
        <button
          className="card-lightbox__close"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="card-lightbox__img-wrap">
          <img
            className="card-lightbox__img"
            src={`/assets/cards/${card.id}.jpg`}
            alt={card.playerName}
          />
        </div>

        <div className="card-lightbox__meta">
          <div className="card-lightbox__name">{card.playerName}</div>
          <div className="card-lightbox__sub">
            #{card.id} · {card.country} · {card.cardType}
          </div>
          <div className={statusClass(count)}>{statusText(count)}</div>

          {price !== null && (
            <>
              <div className="card-lightbox__price">{sym}{price.toFixed(2)}</div>
              <div className="card-lightbox__price-label">
                Avg eBay sold price · {updated}
              </div>
            </>
          )}
        </div>

        <div className="card-lightbox__actions">
          {showQtyRow && (
            <div className="card-lightbox__qty-row">
              <button
                className="card-lightbox__qty-btn"
                aria-label="Remove fewer"
                disabled={clampedQty <= 1}
                onClick={() => changeQty(clampedQty - 1)}
              >
                −
              </button>
              <span className="card-lightbox__qty-val">{clampedQty}</span>
              <button
                className="card-lightbox__qty-btn"
                aria-label="Remove more"
                disabled={clampedQty >= count}
                onClick={() => changeQty(clampedQty + 1)}
              >
                +
              </button>
            </div>
          )}

          <button
            className="card-lightbox__remove"
            aria-label="Remove copies from collection"
            disabled={count === 0}
            onClick={handleRemove}
          >
            {removeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

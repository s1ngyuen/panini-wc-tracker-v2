'use client';

import { useRef } from 'react';
import { Card, BonusCard } from '@/data/cards';
import { FLAG_EMOJI, LIGHT_COLOUR_COUNTRIES, typeToClass } from '@/data/card-display';

interface Props {
  card: Card | BonusCard;
  count: number;
  isPending?: boolean;
  onClick?: () => void;
}

export default function PaniniCard({ card, count, isPending = false, onClick }: Props) {
  const isOwned     = count >= 1;
  const isDuplicate = count >= 2;
  const isMissing   = count === 0;

  const triedFallback = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const cardClasses = [
    'panini-card',
    isOwned     ? 'panini-card--owned'     : '',
    isDuplicate ? 'panini-card--duplicate' : '',
    isMissing   ? 'panini-card--missing'   : '',
  ].filter(Boolean).join(' ');

  const ariaLabel = `Card #${card.id}: ${card.playerName}, ${card.country}, ${card.cardType}${
    isMissing ? ', missing' : isDuplicate ? `, ${count} copies` : ', owned'
  }`;

  function handleImgError() {
    const img = imgRef.current;
    if (!img) return;

    if (!triedFallback.current) {
      triedFallback.current = true;
      img.src = `https://www.laststicker.com/i/cards/12029/${String(card.id).toLowerCase()}.jpg`;
    } else {
      img.style.display = 'none';
      const cardEl = img.closest('.panini-card');
      if (cardEl) {
        cardEl.classList.add('panini-card--no-photo');
        // Append fallback inner if not already present
        if (!cardEl.querySelector('.panini-card__inner')) {
          cardEl.appendChild(buildFallbackInner(card));
        }
      }
    }
  }

  return (
    <div
      className="panini-card-outer"
      role="img"
      aria-label={ariaLabel}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div
        className={cardClasses}
        data-country={card.country}
        data-card-id={card.id}
        title={`#${card.id} ${card.playerName} (${card.country} — ${card.cardType})`}
      >
        <img
          ref={imgRef}
          className="panini-card__photo"
          src={`/assets/cards/${card.id}.jpg`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImgError}
        />
      </div>

      {(isDuplicate || isPending) && (
        <div className="panini-card__badge-stack" aria-hidden="true">
          {isDuplicate && (
            <div
              className="panini-card__dupe-badge"
              title={`You have ${count} copies — ${count - 1} available for swapping.`}
            >
              Duplicate x{count - 1}
            </div>
          )}
          {isPending && (
            <div
              className="panini-card__pending-badge"
              title="On its way to you in a pending trade."
            >
              Pending
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Builds the fallback card inner DOM element when no photo is available.
 * Mirrors v1 buildFallbackInner() exactly.
 */
function buildFallbackInner(card: Card | BonusCard): HTMLDivElement {
  const isLight = LIGHT_COLOUR_COUNTRIES.has(card.country);
  const inner = document.createElement('div');
  inner.className = 'panini-card__inner' + (isLight ? ' card-dark-text' : '');

  const top = document.createElement('div');
  top.className = 'panini-card__top';
  top.setAttribute('aria-hidden', 'true');
  const numEl = document.createElement('span');
  numEl.className = 'panini-card__number';
  numEl.textContent = `#${card.id}`;
  const badgeEl = document.createElement('span');
  badgeEl.className = `panini-card__type-badge panini-card__type-badge--${typeToClass(card.cardType)}`;
  badgeEl.textContent = card.cardType;
  top.appendChild(numEl);
  top.appendChild(badgeEl);

  const middle = document.createElement('div');
  middle.className = 'panini-card__middle';
  middle.setAttribute('aria-hidden', 'true');
  const flagEl = document.createElement('span');
  flagEl.className = 'panini-card__flag';
  flagEl.textContent = FLAG_EMOJI[card.country] ?? '🏳';
  const countryEl = document.createElement('span');
  countryEl.className = 'panini-card__country';
  countryEl.textContent = card.country;
  middle.appendChild(flagEl);
  middle.appendChild(countryEl);

  const bottom = document.createElement('div');
  bottom.className = 'panini-card__bottom';
  bottom.setAttribute('aria-hidden', 'true');
  const nameEl = document.createElement('div');
  nameEl.className = 'panini-card__name';
  nameEl.textContent = card.playerName;
  const wordmarkEl = document.createElement('div');
  wordmarkEl.className = 'panini-card__wordmark';
  wordmarkEl.textContent = 'PANINI';
  bottom.appendChild(nameEl);
  bottom.appendChild(wordmarkEl);

  inner.appendChild(top);
  inner.appendChild(middle);
  inner.appendChild(bottom);
  return inner;
}

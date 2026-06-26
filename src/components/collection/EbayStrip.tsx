'use client';

import { useState, useRef, useCallback } from 'react';
import { CARDS, BONUS_CARDS, Card, BonusCard } from '@/data/cards';
import type { CollectionMap } from '@/types';
import { injectPrices } from '@/lib/prices';

const ALL_CARDS: (Card | BonusCard)[] = [...CARDS, ...BONUS_CARDS];
const BATCH = 5;
const DELAY_MS = 300;

function buildQuery(card: Card | BonusCard): string {
  if (card.playerName === 'Team Crest') {
    return `panini adrenalyn xl world cup 2026 team crest ${card.country}`;
  }
  return `panini adrenalyn xl world cup 2026 ${card.playerName}`;
}

interface Props {
  collection: CollectionMap;
}

export default function EbayStrip({ collection }: Props) {
  const [appId, setAppId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('ebay_app_id') ?? '';
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(false);

  const ownedCards = ALL_CARDS.filter(c => (collection[String(c.id)] ?? 0) > 0);

  const fetchPrices = useCallback(async () => {
    const id = appId.trim();
    if (!id) { setStatus('Enter your eBay App ID first'); return; }
    localStorage.setItem('ebay_app_id', id);

    setLoading(true);
    abortRef.current = false;

    const results: Record<string, number | null> = {};
    let currency = 'AUD';
    const total = ownedCards.length;

    for (let i = 0; i < total && !abortRef.current; i += BATCH) {
      const batch = ownedCards.slice(i, i + BATCH);
      setStatus(`Fetching ${Math.min(i + BATCH, total)} / ${total}…`);

      await Promise.all(batch.map(async card => {
        try {
          const res  = await fetch('/api/ebay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appId: id, query: buildQuery(card) }),
          });
          const data = await res.json();
          results[String(card.id)] = data.price ?? null;
          if (data.currency) currency = data.currency;
        } catch {
          results[String(card.id)] = null;
        }
      }));

      if (i + BATCH < total) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    if (!abortRef.current) {
      injectPrices(results, currency);
      window.dispatchEvent(new CustomEvent('prices-updated'));
      const found = Object.values(results).filter(p => p !== null).length;
      setStatus(`Updated ${new Date().toLocaleTimeString()} · ${found} of ${total} priced`);
    }
    setLoading(false);
  }, [appId, ownedCards]);

  return (
    <div className="ebay-strip">
      <span className="ebay-strip__label">eBay App ID</span>
      <input
        type="text"
        className="ebay-strip__input"
        placeholder="Enter your eBay Developer App ID"
        value={appId}
        onChange={e => setAppId(e.target.value)}
        disabled={loading}
        aria-label="eBay App ID"
      />
      <button
        type="button"
        className="btn-primary ebay-strip__btn"
        onClick={loading ? () => { abortRef.current = true; } : fetchPrices}
      >
        {loading ? 'Stop' : 'Fetch Prices'}
      </button>
      {status && <span className="ebay-strip__status">{status}</span>}
    </div>
  );
}

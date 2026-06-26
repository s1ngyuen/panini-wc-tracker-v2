'use client';

import { useRef } from 'react';
import { parseInput } from '@/lib/swap-utils';
import type { CollectionMap, TradeItem } from '@/types';
import { useToast } from '@/hooks/useToast';

interface Props {
  collection: CollectionMap;
  onSave: (trade: { offering: TradeItem[]; requesting: TradeItem[]; trade_with?: string }) => void;
}

export default function CustomTradeForm({ collection: _collection, onSave }: Props) {
  const { show: showToast } = useToast();
  const partnerRef = useRef<HTMLInputElement>(null);
  const giveRef = useRef<HTMLTextAreaElement>(null);
  const getRef = useRef<HTMLTextAreaElement>(null);

  function handleSave() {
    const partner = partnerRef.current?.value.trim() ?? '';
    const { matched: iGiveCards } = parseInput(giveRef.current?.value ?? '');
    const { matched: iGetCards } = parseInput(getRef.current?.value ?? '');

    if (iGiveCards.length === 0 && iGetCards.length === 0) {
      showToast('Enter at least one card in give or get.', 'error');
      return;
    }

    onSave({
      offering: iGiveCards.map((c) => ({ cardId: String(c.id), count: 1 })),
      requesting: iGetCards.map((c) => ({ cardId: String(c.id), count: 1 })),
      trade_with: partner || undefined,
    });

    // Reset fields
    if (partnerRef.current) partnerRef.current.value = '';
    if (giveRef.current) giveRef.current.value = '';
    if (getRef.current) getRef.current.value = '';
  }

  return (
    <div className="swap-generate-tile">
      <p className="pending-trade-card__form-title">Generate Custom Trade</p>

      <div className="flex flex-col gap-4">
        {/* Partner name */}
        <div>
          <label htmlFor="ct-partner" className="form-label">
            Partner name (optional)
          </label>
          <input
            id="ct-partner"
            ref={partnerRef}
            type="text"
            className="form-input"
            placeholder="e.g. John"
          />
        </div>

        {/* Cards I give */}
        <div>
          <label htmlFor="ct-give" className="form-label">
            Cards I give (IDs or names)
          </label>
          <textarea
            id="ct-give"
            ref={giveRef}
            className="form-textarea"
            placeholder="42, Messi, 87"
          />
        </div>

        {/* Cards I get */}
        <div>
          <label htmlFor="ct-get" className="form-label">
            Cards I get (IDs or names)
          </label>
          <textarea
            id="ct-get"
            ref={getRef}
            className="form-textarea"
            placeholder="55, Ronaldo, 66"
          />
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={handleSave}
          >
            Save Trade
          </button>
        </div>
      </div>
    </div>
  );
}

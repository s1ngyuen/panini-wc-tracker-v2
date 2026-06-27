'use client';

import { useRef, useState } from 'react';
import { CARDS } from '@/data/cards';
import { parseInput, cleanseText, buildSuggestedOffer, buildEqualOffer, nationRank } from '@/lib/swap-utils';
import type { TradeGroup } from '@/lib/swap-utils';
import type { CollectionMap } from '@/types';
import { useToast } from '@/hooks/useToast';

interface Props {
  collection: CollectionMap;
  onMax: (results: TradeGroup[]) => void;
  onGenerateTrade: (groups: TradeGroup[], partnerName: string) => void;
  partnerName: string;
  onPartnerNameChange: (name: string) => void;
}

export default function GenerateTradeForm({
  collection,
  onMax,
  onGenerateTrade,
  partnerName,
  onPartnerNameChange,
}: Props) {
  const { show: showToast } = useToast();
  const havesRef = useRef<HTMLTextAreaElement>(null);
  const wantsRef = useRef<HTMLTextAreaElement>(null);
  const [equalMode, setEqualMode] = useState(false);

  /**
   * Auto-cleanse pasted text — strip emojis, trade-post labels, qty markers.
   */
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const raw = e.clipboardData.getData('text');
    const cleaned = cleanseText(raw);
    const ta = e.currentTarget;
    const start = ta.selectionStart ?? 0;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(ta.selectionEnd ?? start);
    ta.value = before + cleaned + after;
    ta.selectionStart = ta.selectionEnd = start + cleaned.length;
  }

  function getInputData() {
    const havesText = havesRef.current?.value ?? '';
    const wantsText = wantsRef.current?.value ?? '';

    if (!havesText.trim()) {
      showToast('Enter the cards they have first.', 'error');
      return null;
    }

    // Cards we are missing (count === 0 in collection)
    const userMissing = new Set(
      CARDS.filter((c) => (collection[String(c.id)] ?? 0) === 0).map((c) => c.id)
    );

    // Cards we own with count > 1 (duplicates available to offer)
    const myDuplicates = CARDS.filter((c) => (collection[String(c.id)] ?? 0) > 1);

    const { matched: partnerHas } = parseInput(havesText);
    const { matched: partnerWants } = parseInput(wantsText);

    // Cards we want from them: subset of their haves that we're missing,
    // sorted by FIFA nation rank (best nations first)
    const youGet = partnerHas
      .filter((c) => userMissing.has(c.id))
      .sort((a, b) => nationRank(a.country) - nationRank(b.country));

    return { youGet, myDuplicates, partnerWants };
  }

  function handleGenerateTrade() {
    const data = getInputData();
    if (!data) return;
    const { youGet, myDuplicates, partnerWants } = data;
    const groups = equalMode
      ? buildEqualOffer(youGet, myDuplicates, partnerWants)
      : buildSuggestedOffer(youGet, myDuplicates, partnerWants);
    if (groups.length === 0) {
      showToast('No matching trades found.', 'error');
      return;
    }
    onGenerateTrade(groups, partnerName);
  }

  function handleMax() {
    const data = getInputData();
    if (!data) return;
    const { youGet, myDuplicates, partnerWants } = data;
    // Max uses equal-offer mode regardless of the toggle
    const groups = buildEqualOffer(youGet, myDuplicates, partnerWants);
    onMax(groups);
  }

  return (
    <div className="swap-generate-tile">
      <p className="pending-trade-card__form-title">Generate New Trade</p>

      <div className="flex flex-col gap-4">
        {/* Partner name */}
        <div>
          <label htmlFor="swap-partner" className="form-label">
            Partner name (optional)
          </label>
          <input
            id="swap-partner"
            type="text"
            className="form-input"
            placeholder="e.g. John"
            value={partnerName}
            onChange={(e) => onPartnerNameChange(e.target.value)}
          />
        </div>

        {/* Partner haves */}
        <div>
          <label htmlFor="swap-haves" className="form-label">
            Cards they HAVE (they offer you)
          </label>
          <textarea
            id="swap-haves"
            ref={havesRef}
            className="form-textarea"
            placeholder="Card IDs or names — one per line or comma-separated"
            onPaste={handlePaste}
          />
        </div>

        {/* Partner wants */}
        <div>
          <label htmlFor="swap-wants" className="form-label">
            Cards they WANT (from you)
          </label>
          <textarea
            id="swap-wants"
            ref={wantsRef}
            className="form-textarea"
            placeholder="Card IDs or names — one per line or comma-separated"
            onPaste={handlePaste}
          />
        </div>

        {/* Equal-match toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0 2px' }}>
          <label
            className="eq-toggle"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="eq-toggle__track">
              <input
                type="checkbox"
                id="eq-mode-toggle"
                checked={equalMode}
                onChange={(e) => setEqualMode(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <span className="eq-toggle__thumb" />
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Optimise matches
            </span>
          </label>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={handleGenerateTrade}
          >
            Generate Trade
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={handleMax}
          >
            Maximise Trade
          </button>
        </div>
      </div>
    </div>
  );
}
